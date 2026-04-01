// server/services/friends.js
const prisma = require('../prismaClient');

function normalizePair(a, b) {
  return {
    user_one_id: Math.min(a, b),
    user_two_id: Math.max(a, b),
  };
}

async function sendFriendRequest(senderId, receiverId) {
  if (senderId === receiverId) {
    throw new Error('You cannot friend yourself');
  }

  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { user_id: senderId } }),
    prisma.user.findUnique({ where: { user_id: receiverId } }),
  ]);

  if (!sender || !receiver) {
    throw new Error('User not found');
  }

  const pair = normalizePair(senderId, receiverId);

  const existingFriendship = await prisma.friendship.findUnique({
    where: { user_one_id_user_two_id: pair },
  });

  if (existingFriendship) {
    throw new Error('You are already friends');
  }

  const [existingRequest, reverseRequest] = await Promise.all([
    prisma.friendRequest.findUnique({
      where: {
        sender_id_receiver_id: {
          sender_id: senderId,
          receiver_id: receiverId,
        },
      },
    }),
    prisma.friendRequest.findUnique({
      where: {
        sender_id_receiver_id: {
          sender_id: receiverId,
          receiver_id: senderId,
        },
      },
    }),
  ]);

  if (existingRequest && existingRequest.status === 'pending') {
    throw new Error('Request already sent');
  }

  if (reverseRequest && reverseRequest.status === 'pending') {
    throw new Error('This user already sent you a friend request');
  }

  return prisma.friendRequest.create({
    data: {
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
    },
  });
}

async function acceptFriendRequest(requestId) {
  const req = await prisma.friendRequest.findUnique({
    where: { request_id: requestId },
  });

  if (!req) {
    throw new Error('Request not found');
  }

  if (req.status !== 'pending') {
    throw new Error('Request already handled');
  }

  const pair = normalizePair(req.sender_id, req.receiver_id);

  return prisma.$transaction(async (tx) => {
    const existingFriendship = await tx.friendship.findUnique({
      where: { user_one_id_user_two_id: pair },
    });

    if (existingFriendship) {
      throw new Error('Users are already friends');
    }

    const updatedRequest = await tx.friendRequest.update({
      where: { request_id: requestId },
      data: { status: 'accepted' },
    });

    const friendship = await tx.friendship.create({
      data: pair,
    });

    return { updatedRequest, friendship };
  });
}

async function rejectFriendRequest(requestId) {
  const req = await prisma.friendRequest.findUnique({
    where: { request_id: requestId },
  });

  if (!req) {
    throw new Error('Request not found');
  }

  if (req.status !== 'pending') {
    throw new Error('Request already handled');
  }

  return prisma.friendRequest.update({
    where: { request_id: requestId },
    data: { status: 'rejected' },
  });
}

async function getFriends(userId) {
  const rows = await prisma.friendship.findMany({
    where: {
      OR: [{ user_one_id: userId }, { user_two_id: userId }],
    },
    include: {
      userOne: true,
      userTwo: true,
    },
  });

  return rows.map((row) =>
    row.user_one_id === userId ? row.userTwo : row.userOne
  );
}

async function getPendingRequests(userId) {
  return prisma.friendRequest.findMany({
    where: {
      receiver_id: userId,
      status: 'pending',
    },
    include: {
      sender: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
};