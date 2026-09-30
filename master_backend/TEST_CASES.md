# API test runner

`npm test` runs the 21 HTTP scenarios in `test_runner.js` against `API_URL` (default `http://127.0.0.1:5000`). It expects the demo accounts from `npm run seed:import` to exist and removes the temporary user and product created during a successful run.

The seed import deletes all documents in the configured users and products collections before inserting demo data. Use a disposable MongoDB database for seeding and testing.

| # | Scenario | Method and route | Expected |
| --- | --- | --- | --- |
| 01 | API discovery directory | `GET /` | 200 |
| 02 | System health check | `GET /api/health` | 200 |
| 03 | Missing required fields | `POST /api/auth/register` | 400 |
| 04 | Register standard user | `POST /api/auth/register` | 201 |
| 05 | Duplicate email blocked | `POST /api/auth/register` | 409 |
| 06 | Seeded moderator login | `POST /api/auth/login` | 200 |
| 07 | Seeded administrator login | `POST /api/auth/login` | 200 |
| 08 | Wrong password rejection | `POST /api/auth/login` | 401 |
| 09 | Valid login and token issue | `POST /api/auth/login` | 200 |
| 10 | Get user profile | `GET /api/auth/me` | 200 |
| 11 | Missing bearer token | `GET /api/auth/me` | 401 |
| 12 | Update profile details | `PUT /api/auth/updatedetails` | 200 |
| 13 | User blocked from admin routes | `GET /api/users` | 403 |
| 14 | Admin can list users | `GET /api/users` | 200 |
| 15 | Public product catalog | `GET /api/products` | 200 |
| 16 | User cannot create a product | `POST /api/products` | 403 |
| 17 | Moderator can create a product | `POST /api/products` | 201 |
| 18 | Fetch product by ID | `GET /api/products/:id` | 200 |
| 19 | Moderator cannot delete product | `DELETE /api/products/:id` | 403 |
| 20 | Admin can delete product | `DELETE /api/products/:id` | 200 |
| 21 | Undefined route fallback | `GET /api/undefined-route` | 404 |

Elevated roles are provisioned by the seeder or an administrator. Public registration always creates a `user`, even if a caller includes a `role` field.
