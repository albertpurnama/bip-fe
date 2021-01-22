import faunadb from "faunadb";
import "./App.sass";
import React, { useEffect, useState } from "react";

// faunaDB secret Key
const FAUNA_DB_SECRET = "fnAEAKQ_T0ACCL0uncMNsyKVos0J9krJyYNDOBxm";

const client = new faunadb.Client({
  secret: FAUNA_DB_SECRET,
});
const q = faunadb.query;

function App() {
  const [streakData, setStreakData] = useState([]);
  useEffect(() => {
    client
      .query(
        q.Map(
          q.Paginate(q.Match(q.Index("streaks_sort_by_count")), { size: 100 }),
          q.Lambda(["count", "streakRef"], q.Get(q.Var("streakRef")))
        )
      )
      .then((response) => {
        setStreakData(response.data);
      });
  }, []);

  return (
    <section className="section container">
      <div className="title">#BuildInPublic Leaderboard</div>
      <div className="subtitle mb-6">
        To enter this leaderboard, you just need to tweet with hashtag
        #BuildInPublic!
      </div>
      <div className="notification is-warning">
        Don't break your daily streak! The streak count will reset if you don't
        post any progress on #BuildInPublic within a day!
      </div>
      <div className="box">
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {streakData.map(({ data }, index) => (
              <tr key={data.user_id}>
                <td>{index + 1}</td>
                <td>
                  <a href={`https://twitter.com/${data.username}`}>
                    {data.username ?? "no username"}
                  </a>
                </td>
                <td>{data.count} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default App;
