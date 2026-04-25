import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PlannerDetails() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  // 🔥 LIVE TIMER
  useEffect(() => {
    let interval;

    if (runningId) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [runningId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://127.0.0.1:8000/planner/${id}/details`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ✅ TIMER APIs
  const handleStart = async (studyId) => {
    await axios.post(`http://127.0.0.1:8000/start/${studyId}`);
    setRunningId(studyId);
    setSeconds(0);
  };

  const handlePause = async (studyId) => {
    await axios.post(`http://127.0.0.1:8000/pause/${studyId}`);
    setRunningId(null);
  };

  const handleResume = async (studyId) => {
    await axios.post(`http://127.0.0.1:8000/resume/${studyId}`);
    setRunningId(studyId);
  };

  const markComplete = async (studyId) => {
    await axios.put(
      `http://127.0.0.1:8000/planner/complete/${studyId}`
    );
    setRunningId(null);
    fetchPlan();
  };

  // ✅ Progress
  const totalLessons = data.length;
  const completedLessons = data.filter(
    (item) => item.status === "completed"
  ).length;

  const progress =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  // ✅ Group by day
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.day_number]) {
      acc[item.day_number] = [];
    }
    acc[item.day_number].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Planner Details</h2>

      {/* 🔥 Progress */}
      <h3>Progress: {progress}%</h3>

      <div style={{
        width: "100%",
        height: "20px",
        backgroundColor: "#17fb07",
        borderRadius: "10px",
        marginBottom: "20px"
      }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "green",
          borderRadius: "10px"
        }}></div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        Object.keys(groupedData).map((day) => (
          <div key={day} style={{
            border: "2px solid black",
            marginBottom: "20px",
            padding: "15px",
            borderRadius: "10px"
          }}>
            <h3>📌 Day {day}</h3>

            {groupedData[day].map((item) => (
              <div key={item.id} style={{
                border: "1px solid gray",
                margin: "10px",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor:
                  item.status === "completed"
                    ? "#096d20"
                    : "#042e0a"
              }}>
                <p><b>📘 Lesson:</b> {item.lesson_name}</p>

                <p>
                  <b>Status:</b>{" "}
                  {item.status === "completed"
                    ? "✅ Completed"
                    : "⏳ Pending"}
                </p>

                {/* 🔥 TIMER DISPLAY */}
                {runningId === item.id && (
                  <p>⏱️ Running: {seconds}s</p>
                )}

                {/* 🔥 BUTTONS */}
                {item.status !== "completed" && (
                  <div>
                    <button onClick={() => handleStart(item.id)}>▶️ Start</button>

                    <button onClick={() => handlePause(item.id)}>⏸ Pause</button>

                    <button onClick={() => handleResume(item.id)}>🔁 Resume</button>

                    <br />

                    <button
                      onClick={() => markComplete(item.id)}
                      style={{ marginTop: "5px" }}
                    >
                      ✅ Complete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default PlannerDetails;