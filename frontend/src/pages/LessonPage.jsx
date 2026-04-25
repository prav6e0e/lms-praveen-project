import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function LessonPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/lesson/${lessonId}`);
      setLesson(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!lesson) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Lesson Page.jsx</h2>
      <h2>{lesson.title}</h2>

      {/* 🔥 TEXT CONTENT */}
      <p>{lesson.content}</p>

      {/* 🔥 PDF VIEW */}
      {lesson.pdf_url && (
        <div>
          <h3>📄 PDF</h3>
          <a
            href={`http://127.0.0.1:8000/${lesson.file_url}`}
            target="_blank"
            rel="noreferrer"
          >
            View PDF
          </a>

          <iframe
            src={`http://127.0.0.1:8000/${lesson.file_url}`}
            width="100%"
            height="500px"
            title="PDF Viewer"
          />
        </div>
      )}

      {/* 🔥 VIDEO VIEW */}
      {lesson.video_url && (
        <div>
          <h3>🎥 Video</h3>
          <video
            src={`http://127.0.0.1:8000/${lesson.video_url}`}
            controls
            width="400"
          />
        </div>
      )}

      {/* 🔥 AUDIO VIEW */}
      {lesson.audio_url && (
        <div>
          <h3>🔊 Audio</h3>
          <audio src={`http://127.0.0.1:8000/${lesson.audio_url}`} controls />
        </div>
      )}
    </div>
  );
}

export default LessonPage;
