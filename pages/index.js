import faunadb from "faunadb";
import Head from 'next/head';
import { useEffect, useState } from "react";


// faunaDB secret Key
const FAUNA_DB_SECRET = "***REMOVED***";

const client = new faunadb.Client({
  secret: FAUNA_DB_SECRET,
});
const q = faunadb.query;

export default function Home({ streaks, ranks }) {

  const emotions = ["💪 🔥", "🔥"];
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [searchUserName, setSearchUserName] = useState(null);
  const [dataLength, setDataLength] = useState(streaks.length);

  const renderRow = (data) => {
    return (
      <tr key={data.user_id} className="flex-row">
        <td className="px-6 py-4 whitespace-nowrap w-1/5">{data.rank}</td>
        <td className="px-6 py-4 whitespace-nowrap hover:text-blue-700">
          <a href={`https://twitter.com/${data.username}`} target="_blank">
            {data.username ?? "no username"} {emotions[data.rank - 1]}
          </a>
        </td>
        <td className="w-1/5 px-6 py-4 whitespace-nowrap text-right">
          {data.count} days
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <Head>
        <script async defer data-domain="https://bipleaderboard.netlify.app" src="https://analytics.apurn.com/js/plausible.js"></script>
      </Head>
      <h1 className="text-4xl py-6 font-medium">#BuildInPublic Leaderboard</h1>

      <div className="subtitle mb-6">
        To enter this leaderboard, you just need to tweet with hashtag
        #BuildInPublic!
      </div>
      <div className="max-w-2xl m-4 bg-red-300 rounded p-4 ">
        Don't break your daily streak! The streak count will reset if you don't
        post any progress on #BuildInPublic within a day!
      </div>
      <div className="shadow flex rounded-lg my-3">
        <input
          className="w-full rounded-lg p-2"
          type="text"
          placeholder="Search..."
          onChange={(event) =>
            setSearchUserName(
              event.target.value !== "" ? event.target.value : null
            )
          }
        />
        <button className="bg-white w-auto flex justify-end items-center text-grey p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            height="1rem"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rank
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right"
                    >
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!searchUserName &&
                    streaks
                      .slice((page - 1) * sizePerPage, page * sizePerPage)
                      .map(renderRow)}
                  {searchUserName &&
                    streaks
                      .filter((streak) =>
                        streak.username
                          ?.toLowerCase()
                          .includes(searchUserName.toLowerCase())
                      )
                      .map(renderRow)}
                </tbody>
                <tfoot className="bg-gray-50">
                  <td colSpan="2" className="px-6 py-3 text-right">
                    Pages
                  </td>
                  <td className="px-6 py-3 flex flex-row justify-center items-center">
                    {page !== 1 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        height="1rem"
                        onClick={() => setPage(Math.max(page - 1, 1))}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                    )}

                    <div className="px-5">{page}</div>
                    {page * sizePerPage < dataLength && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        height="1rem"
                        onClick={() => setPage(page + 1)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    )}
                  </td>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps(context) {
  let response = await client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index("streaks_sort_by_count")), { size: 10000 }),
        q.Lambda(["count", "streakRef"], q.Get(q.Var("streakRef")))
      )
    )
    .then((response) =>
      response.data.map(({ data }, index) => ({
        count: data.count,
        updated_at: data.updated_at.value,
        user_id: data.user_id,
        username: data.username,
        rank: index + 1,
      }))
    );

  return {
    props: {
      streaks: response,
    }, // will be passed to the page component as props
  };
}
