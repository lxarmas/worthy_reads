// server/services/friends.js
const pool = require('../db');

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

  const { rows: users } = await pool.query(
    `SELECT user_id
     FROM users
     WHERE user_id = ANY($1::int[])`,
    [[senderId, receiverId]]
  );

  if (users.length !== 2) {
    throw new Error('User not found');
  }

  const pair = normalizePair(senderId, receiverId);

  const { rows: existingFriendship } = await pool.query(
    `SELECT friendship_id
     FROM friendships
     WHERE user_one_id = $1 AND user_two_id = $2`,
    [pair.user_one_id, pair.user_two_id]
  );

  if (existingFriendship.length > 0) {
    throw new Error('You are already friends');
  }

  const { rows: requests } = await pool.query(
    `SELECT request_id, sender_id, receiver_id, status
     FROM friend_requests
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)`,
    [senderId, receiverId]
  );

  const existingRequest = requests.find(
    (r) => Number(r.sender_id) === senderId && Number(r.receiver_id) === receiverId
  );

  const reverseRequest = requests.find(
    (r) => Number(r.sender_id) === receiverId && Number(r.receiver_id) === senderId
  );

  if (existingRequest && existingRequest.status === 'PENDING') {
    throw new Error('Request already sent');
  }

  if (reverseRequest && reverseRequest.status === 'PENDING') {
    throw new Error('This user already sent you a friend request');
  }

  const { rows } = await pool.query(
    `INSERT INTO friend_requests
      (sender_id, receiver_id, status, created_at, updated_at)
     VALUES ($1, $2, 'PENDING', NOW(), NOW())
     RETURNING request_id, sender_id, receiver_id, status, created_at`,
    [senderId, receiverId]
  );

  return rows[0];
}

async function acceptFriendRequest(requestId) {
  const { rows: reqRows } = await pool.query(
    `SELECT request_id, sender_id, receiver_id, status
     FROM friend_requests
     WHERE request_id = $1`,
    [requestId]
  );

  const req = reqRows[0];

  if (!req) {
    throw new Error('Request not found');
  }

  if (req.status !== 'PENDING') {
    throw new Error('Request already handled');
  }

  const pair = normalizePair(req.sender_id, req.receiver_id);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: existingFriendship } = await client.query(
      `SELECT friendship_id
       FROM friendships
       WHERE user_one_id = $1 AND user_two_id = $2`,
      [pair.user_one_id, pair.user_two_id]
    );

    if (existingFriendship.length > 0) {
      throw new Error('Users are already friends');
    }

    const { rows: updatedRequestRows } = await client.query(
      `UPDATE friend_requests
       SET status = 'ACCEPTED', updated_at = NOW()
       WHERE request_id = $1
       RETURNING request_id, sender_id, receiver_id, status, updated_at`,
      [requestId]
    );

    const { rows: friendshipRows } = await client.query(
      `INSERT INTO friendships (user_one_id, user_two_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING friendship_id, user_one_id, user_two_id, created_at`,
      [pair.user_one_id, pair.user_two_id]
    );

    await client.query('COMMIT');

    return {
      updatedRequest: updatedRequestRows[0],
      friendship: friendshipRows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function rejectFriendRequest(requestId) {
  const { rows: reqRows } = await pool.query(
    `SELECT request_id, status
     FROM friend_requests
     WHERE request_id = $1`,
    [requestId]
  );

  const req = reqRows[0];

  if (!req) {
    throw new Error('Request not found');
  }

  if (req.status !== 'PENDING') {
    throw new Error('Request already handled');
  }

  const { rows } = await pool.query(
    `UPDATE friend_requests
     SET status = 'REJECTED', updated_at = NOW()
     WHERE request_id = $1
     RETURNING request_id, sender_id, receiver_id, status, updated_at`,
    [requestId]
  );

  return rows[0];
}

async function getFriends(userId) {
  const { rows } = await pool.query(
    `SELECT
       f.friendship_id,
       f.created_at AS friendship_created_at,
       u.user_id,
       u.email,
       u.username,
       u.first_name,
       u.last_name,
       u.created_at
     FROM friendships f
     JOIN users u
       ON u.user_id = CASE
         WHEN f.user_one_id = $1 THEN f.user_two_id
         ELSE f.user_one_id
       END
     WHERE f.user_one_id = $1 OR f.user_two_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    friendship_id: row.friendship_id,
    user_id: row.user_id,
    email: row.email,
    username: row.username,
    first_name: row.first_name,
    last_name: row.last_name,
    created_at: row.created_at,
    friendship_created_at: row.friendship_created_at,
  }));
}

async function getPendingRequests(userId) {
  const { rows } = await pool.query(
    `SELECT
       fr.request_id,
       fr.sender_id,
       fr.receiver_id,
       fr.status,
       fr.created_at,
       u.user_id,
       u.email,
       u.username,
       u.first_name,
       u.last_name,
       u.created_at AS user_created_at
     FROM friend_requests fr
     JOIN users u ON u.user_id = fr.sender_id
     WHERE fr.receiver_id = $1
       AND fr.status = 'PENDING'
     ORDER BY fr.created_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    request_id: row.request_id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id,
    status: row.status,
    created_at: row.created_at,
    sender: {
      user_id: row.user_id,
      email: row.email,
      username: row.username,
      first_name: row.first_name,
      last_name: row.last_name,
      created_at: row.user_created_at,
    },
  }));
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
};