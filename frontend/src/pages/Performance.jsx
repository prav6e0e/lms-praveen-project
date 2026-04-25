import { useEffect, useState } from "react";
import axios from "axios";
import "./performance.css";

function Performance() {
  const API = "http://127.0.0.1:8000";

  const [data, setData] = useState([]);

  const fetchPerformance = async () => {
    try {
      const res = await axios.get(`${API}/performance`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  return (
    <div className="performance-container">
      <h2>📊 Performance Analytics</h2>

      {data.length === 0 ? (
        <p>No data available</p>
      ) : (
        <table className="performance-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Active Plans</th>
              <th>Completed Plans</th>
              <th>Completion %</th>
            </tr>
          </thead>

          <tbody>
            {data.map((d) => (
              <tr key={d.user_id}>
                <td>{d.user_id}</td>
                <td>{d.active_plans}</td>
                <td>{d.completed_plans}</td>
                <td
                  className={
                    d.completion_rate > 50 ? "good" : "average"
                  }
                >
                  {d.completion_rate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Performance;