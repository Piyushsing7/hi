// Import React Suspense for fallback loading UI, Next.js Link for navigation, and Bootstrap styles
import { Suspense } from 'react';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

// Async function to fetch user data from API, with optional pagination and search
async function fetchUsers(page: number, limit: number = 8, search: string = '') {
  try {
    // If a search term is provided, fetch all users and filter manually
    if (search) {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users`, {
        cache: 'no-store', // Prevent caching for real-time results
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();

      // Filter users whose names include the search string (case-insensitive)
      const filtered = users.filter((user: any) =>
        user.name.toLowerCase().includes(search.toLowerCase())
      );

      // Paginate the filtered results
      const start = (page - 1) * limit;
      const end = start + limit;

      return { users: filtered.slice(start, end), total: filtered.length };
    } else {
      // If no search term, fetch paginated users directly from API
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users?_page=${page}&_limit=${limit}`,
        {
          cache: 'no-store', // No caching
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();

      // Extract total user count from response headers
      const total = Number(response.headers.get('x-total-count')) || 10;

      return { users, total };
    }
  } catch (err) {
    console.error('Fetch error:', err);
    return { users: [], total: 0 }; // Return empty data on failure
  }
}

// Async server component for displaying the user dashboard
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  // Await the incoming query parameters
  const params = await searchParams;
  const page = Number(params.page) || 1; // Default to page 1
  const search = params.search || ''; // Default to empty search
  const limit = 8; // Users per page

  // Fetch user data
  const { users, total } = await fetchUsers(page, limit, search);
  const totalPages = Math.ceil(total / limit); // Calculate number of pages

  // Optional debug logs
  console.log('Search term:', search);
  console.log('Current page:', page);
  console.log('Fetched users:', users);
  console.log('Total users:', total);
  console.log('Total pages:', totalPages);

  return (
    <div className="page-container">
      {/* Inline CSS for background animation and styling */}
      <style>{`
        .page-container {
          min-height: 100vh;
          height: 100%;
          position: relative;
          background: linear-gradient(
            45deg,
            rgba(227, 242, 253, 0.7), /* Light Blue */
            rgba(232, 245, 233, 0.7), /* Light Green */
            rgba(255, 235, 238, 0.7), /* Light Red */
            rgba(255, 253, 231, 0.7)  /* Light Yellow */
          ) !important;
          background-size: 400% 400%;
          animation: bgColorShift 12s ease infinite;
        }

        @keyframes bgColorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .user-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          border-radius: 8px;
          background-color: #fff;
          border: 2px solid #e0e0e0;
          animation: fadeInScale 0.5s ease forwards;
          animation-delay: calc(var(--index) * 0.1s);
        }

        .user-card-1 { background-color: #E3F2FD; } /* Light Blue */
        .user-card-2 { background-color: #E8F5E9; } /* Light Green */
        .user-card-3 { background-color: #FFEBEE; } /* Light Red */
        .user-card-4 { background-color: #FFFDE7; } /* Light Yellow */

        .user-card:hover {
          transform: translateY(-5px) scale(1.03);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          border: 2px solid transparent;
          animation: rgbMixedBorder 4s linear infinite;
        }

        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes rgbMixedBorder {
          0% { border-color: red; }
          20% { border-color: magenta; }
          40% { border-color: blue; }
          60% { border-color: cyan; }
          80% { border-color: green; }
          100% { border-color: red; }
        }

        .header-row {
          background-color: lightskyblue;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .search-input {
          transition: border-color 0.3s ease;
          border: 1px solid #ced4da;
        }

        .search-input:hover, .search-input:focus {
          border: 2px solid transparent;
          animation: rgbMixedBorder 4s linear infinite;
        }

        .card-body h5 {
          color: #333;
        }

        .card-body p {
          color: #555;
        }

        .card-body p strong {
          color: #333;
        }

        .container {
          position: relative;
          z-index: 1;
        }
      `}</style>

      {/* Main Content Container */}
      <div className="container py-4">

        {/* Header: Title + Search Bar */}
        <div className="header-row d-flex justify-content-between align-items-center">
          <h1 className="mb-0">User Dashboard</h1>
          <form action="/" method="GET" className="d-flex" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              name="search"
              className="form-control me-2 search-input"
              placeholder="Search users by name..."
              defaultValue={search}
              aria-label="Search users"
            />
            <input type="hidden" name="page" value="1" />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        {/* No Users Found Message */}
        {users.length === 0 && (
          <div className="alert alert-warning" role="alert">
            {search
              ? `No users found for "${search}".`
              : 'No users available. Please try again later.'}
          </div>
        )}

        {/* Users Grid */}
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <div className="row">
            {users.map((user: any, index: number) => (
              <div key={user.id} className="col-lg-3 col-md-6 mb-3">
                {/* User Card with color rotation */}
                <div className={`card h-100 user-card user-card-${(index % 4) + 1}`} style={{ '--index': index } as any}>
                  <div className="card-body">
                    <h5 className="card-title">{user.name}</h5>
                    <p className="card-text">
                      <strong>Email:</strong> {user.email}<br />
                      <strong>Phone:</strong> {user.phone}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Suspense>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mt-4">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                <Link href={{ pathname: '/', query: { page: page - 1, search } }} className="page-link">
                  Previous
                </Link>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <Link href={{ pathname: '/', query: { page: i + 1, search } }} className="page-link">
                    {i + 1}
                  </Link>
                </li>
              ))}
              <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                <Link href={{ pathname: '/', query: { page: page + 1, search } }} className="page-link">
                  Next
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
