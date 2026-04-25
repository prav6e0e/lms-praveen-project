import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function CoursePage() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/lesson/course/${courseId}/lessons`
      );
      setLessons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Course Page.jsx</h2>

      {lessons.length === 0 ? (
        <p>No lessons found</p>
      ) : (
        lessons.map((lesson,index) => (
          <div
            key={lesson.id || index}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px"
            }}
          >
            <h3>{lesson.title}</h3>

            <button onClick={() => navigate(`/lesson/${lesson.id}`)}>
              Open Lesson
            </button>
            
          </div>
        ))
      )}
    </div>
  );
}

export default CoursePage;