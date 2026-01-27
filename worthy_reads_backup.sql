--
-- PostgreSQL database dump
--

\restrict RbGPIZaaFhAftvZODMQRoYVLYARwH6VU8PHvdsgibHSua1nelnB8nsRkCRtVCMb

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    book_id integer NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    image_link text,
    user_id integer,
    description_book text,
    categories text[],
    preview_link text,
    rating integer
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: books_book_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.books_book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.books_book_id_seq OWNER TO postgres;

--
-- Name: books_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.books_book_id_seq OWNED BY public.books.book_id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    user_id integer NOT NULL,
    token character varying(100) NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: books book_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books ALTER COLUMN book_id SET DEFAULT nextval('public.books_book_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (book_id, title, author, image_link, user_id, description_book, categories, preview_link, rating) FROM stdin;
12	The Literary Language of Shakespeare	S.S. Hussey	http://books.google.com/books/content?id=nhmvDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api	8	Professor Hussey looks at the vocabulary, syntax and register of Renaissance English, following this with a more detailed analysis of particular kinds of language in the plays such as prose, verse, rhetoric and the soliloquy. For this new edition, the text has been revised throughout with, in particular, a completely new chapter providing detailed readings of selected plays, illustrating the ways particular aspects of language can be studied in practice.	{Drama}	http://books.google.com/books?id=nhmvDwAAQBAJ&pg=PT87&dq=intitle:the+little+prince+inauthor:ss&hl=&cd=1&source=gbs_api	\N
13	The Three Musketeers	Alexandre Dumas	http://books.google.com/books/content?id=KW0YAAAAYAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api	8	One of the preeminent novels by French writer Alexandre Dumas, this swashbuckling tale follows a group of honorable 17th-century swordsmen who must contend with powerful adversaries scheming against the queen. Determined to join the royal guard, young d'Artagnan leaves his country home and travels to Paris, where he unintentionally angers Aramis, Athos, and Porthos, the esteemed Three Musketeers. Eventually winning the trust and admiration of the formidable trio of fighters, d'Artagnan joins them in their quest to thwart the plans of the sinister Cardinal Richelieu.	{Uncategorized}	http://books.google.com/books?id=KW0YAAAAYAAJ&printsec=frontcover&dq=intitle:the+three+musketeers+inauthor:alexandre+duma&hl=&cd=1&source=gbs_api	\N
14	Cien años de soledad	Gabriel García Márquez	http://books.google.com/books/content?id=kmAQCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api	9	Señalada como «catedral gótica del lenguaje», este clásico del siglo XX es el enorme y espléndido tapiz de la saga de la familia Buendía, en la mítica aldea de Macondo. UNO DE LOS 5 LIBROS MÁS IMPORTANTES DE LOS ÚLTIMOS 125 AÑOS SEGÚN THE NEW YORK TIMES Un referente imprescindible de la vida y la narrativa latinoamericana. «Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas que se precipitaban por un lecho de piedras pulidas, blancas y enormes como huevos prehistóricos. El mundo era tan reciente, que muchas cosas carecían de nombre, y para mencionarlas había que señalarlas con el dedo». Con estas palabras empieza la novela ya legendaria en los anales de la literatura universal, una de las aventuras literarias más fascinantes de nuestro siglo. Millones de ejemplares de Cien años de soledad leídos en todas las lenguas y el Premio Nobel de Literatura coronando una obra que se había abierto paso «boca a boca» -como gusta decir al escritor- son la más palpable demostración de que la aventura fabulosa de la familia Buendía-Iguarán, con sus milagros, fantasías, obsesiones, tragedias, incestos, adulterios, rebeldías, descubrimientos y condenas, representaba al mismo tiempo el mito y la historia, la tragedia y el amor del mundo entero. Pablo Neruda dijo... «El Quijote de nuestro tiempo.»	{Fiction}	http://books.google.com/books?id=kmAQCwAAQBAJ&printsec=frontcover&dq=intitle:cien+anos+de+soledad++inauthor:Gabriel+garcia+marquez&hl=&cd=1&source=gbs_api	2
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (user_id, token, expires_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, first_name, last_name) FROM stdin;
8	lxarmas@gmail.com	$2b$10$Og.ykO/MiDh6R9glPVa9bOy8rs8lCD6pd0gX0qqjh/J2KpG5ggBhy	ale 	armas 
9	Montes@gmail.com	$2b$10$mW6FhEsjX8U1VdAj6j2paeROxFnyIIZ.WgA6.7ytedZtaf2fyssWO	Albania 	Montes
10	arias@gmail.com	$2b$10$1hk.KAZODni1H1kz3rXlAOlku14I.sEXuAgK0dZKpmxVOcgZiViiC	carlos 	arias 
\.


--
-- Name: books_book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_book_id_seq', 14, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 10, true);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (book_id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (user_id, token);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: books books_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict RbGPIZaaFhAftvZODMQRoYVLYARwH6VU8PHvdsgibHSua1nelnB8nsRkCRtVCMb

