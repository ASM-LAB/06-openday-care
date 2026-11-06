import type { ReactNode } from "react";
import Link from "next/link";

type IconName =
  | "announcement"
  | "camera"
  | "children"
  | "heart"
  | "home"
  | "image"
  | "logout"
  | "message"
  | "plus"
  | "sun"
  | "user"
  | "bell";

type IconProps = {
  name: IconName;
  size?: number;
};

function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "announcement" && (
        <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
      )}
      {name === "bell" && (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </>
      )}
      {name === "camera" && (
        <>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </>
      )}
      {name === "children" && (
        <>
          <circle cx="9" cy="7" r="3" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
        </>
      )}
      {name === "heart" && (
        <path
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"
          fill="currentColor"
        />
      )}
      {name === "home" && (
        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      )}
      {name === "image" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
        </>
      )}
      {name === "logout" && (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </>
      )}
      {name === "message" && (
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
      )}
      {name === "plus" && <path d="M12 5v14M5 12h14" />}
      {name === "sun" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
      {name === "user" && (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      )}
    </svg>
  );
}

type PostProps = {
  author: string;
  authorInitial: string;
  time: string;
  audience: string;
  category: string;
  categoryColor: "green" | "blue" | "purple";
  children: ReactNode;
  likes: number;
  comments: number;
  announcement?: boolean;
  photo?: boolean;
};

function Post({
  author,
  authorInitial,
  time,
  audience,
  category,
  categoryColor,
  children,
  likes,
  comments,
  announcement = false,
  photo = false,
}: PostProps) {
  return (
    <article className="post">
      <div className="postHeader">
        <div
          className={`avatar ${announcement ? "announcementAvatar" : "childAvatar"}`}
        >
          {announcement ? <Icon name="announcement" size={20} /> : authorInitial}
        </div>
        <div className="authorDetails">
          <div className="authorName">{author}</div>
          <div className="postTime">{time} · publicado por vos</div>
        </div>
        <div className={`category ${categoryColor}`}>
          <span className="categoryDot" />
          <span>{category}</span>
        </div>
      </div>
      <div className="audience">Para: {audience}</div>
      <p className="postText">{children}</p>
      {photo && (
        <div className="photoPlaceholder" role="img" aria-label="Foto · pintando con témperas">
          <Icon name="image" size={30} />
          <span>Foto · pintando con témperas</span>
        </div>
      )}
      <div className="postActions">
        <span className="likeCount">
          <Icon name="heart" size={19} />
          {likes}
        </span>
        <span className="commentCount">
          <Icon name="message" size={18} />
          {comments}
        </span>
        <span className="actionSpacer" />
        <span className="editLabel">Editar</span>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="feedPage">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brandMark">
            <Icon name="sun" size={21} />
          </span>
          <span className="brandText">
            <span className="brandName">OpenDayCare</span>
            <span className="roomName">Sala Soles</span>
          </span>
        </Link>

        <div className="createButton">
          <Icon name="plus" size={17} />
          Nueva publicación
        </div>

        <div className="navigation">
          <Link
            href="/"
            className="navigationItem navigationItemActive"
            aria-current="page"
          >
            <Icon name="home" size={19} />
            Feed
          </Link>
          <Link href="/kids" className="navigationItem">
            <Icon name="children" size={19} />
            Kids
          </Link>
          <div className="navigationItem">
            <Icon name="bell" size={19} />
            Avisos
          </div>
          <div className="navigationItem">
            <Icon name="user" size={19} />
            Mi cuenta
          </div>
        </div>

        <div className="profile">
          <div className="profileRow">
            <div className="profileAvatar">C</div>
            <div className="profileDetails">
              <div className="profileName">Caro Giménez</div>
              <div className="profileRole">Maestra · Soles</div>
            </div>
            <span className="logoutControl" title="Cerrar sesión">
              <Icon name="logout" size={16} />
            </span>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="content">
          <header className="welcome">
            <div className="roomLabel">GUARDERÍA · SALA SOLES</div>
            <h1>Buenas, Caro</h1>
            <p>12 niños · martes 17 jun</p>
          </header>

          <div className="composer">
            <div className="composerAvatar">C</div>
            <span className="composerPrompt">Compartí un momento…</span>
            <span className="cameraControl">
              <Icon name="camera" size={19} />
            </span>
          </div>

          <div className="sectionHeading">
            <span>PUBLICADO HOY</span>
            <span className="sectionRule" />
          </div>

          <div className="posts">
            <Post
              author="Mateo"
              authorInitial="M"
              time="14:20"
              audience="familia de Mateo"
              category="LOGRO"
              categoryColor="green"
              likes={3}
              comments={1}
            >
              ¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.
            </Post>

            <Post
              author="Mateo"
              authorInitial="M"
              time="09:40"
              audience="familia de Mateo"
              category="ACTIVIDAD"
              categoryColor="blue"
              likes={5}
              comments={2}
              photo
            >
              Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.
            </Post>

            <Post
              author="Anuncio general"
              authorInitial=""
              time="07:50"
              audience="toda la sala"
              category="ANUNCIO"
              categoryColor="purple"
              likes={8}
              comments={0}
              announcement
            >
              El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.
            </Post>
          </div>
        </div>
      </main>
    </div>
  );
}
