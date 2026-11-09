const requiredEnvironmentVariables = [
  "LOCAL_SUPABASE_URL",
  "LOCAL_SUPABASE_SERVICE_ROLE_KEY",
  "LOCAL_STAFF_EMAIL",
  "LOCAL_STAFF_PASSWORD",
];

for (const name of requiredEnvironmentVariables) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const supabaseUrl = new URL(process.env.LOCAL_SUPABASE_URL);
if (!["localhost", "127.0.0.1"].includes(supabaseUrl.hostname.toLowerCase())) {
  throw new Error("LOCAL_SUPABASE_URL must use localhost or 127.0.0.1");
}
if (supabaseUrl.protocol !== "http:" || supabaseUrl.username || supabaseUrl.password) {
  throw new Error("LOCAL_SUPABASE_URL must be a plain local HTTP URL");
}

const serviceRoleKey = process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY;
const credentials = {
  email: process.env.LOCAL_STAFF_EMAIL,
  password: process.env.LOCAL_STAFF_PASSWORD,
};

function endpoint(path) {
  return new URL(path, supabaseUrl.origin);
}

async function requestJson(path, { method = "GET", body, prefer } = {}) {
  const response = await fetch(endpoint(path), {
    method,
    redirect: "error",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const responseText = await response.text();
  let responseBody;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    throw new Error(`${method} ${path} failed with HTTP ${response.status}`);
  }

  return responseBody;
}

async function findLocalDaycareId() {
  const daycareUrl = endpoint("/rest/v1/daycares");
  daycareUrl.searchParams.set("name", "eq.Daycare de prueba");
  daycareUrl.searchParams.set("select", "id");
  daycareUrl.searchParams.set("limit", "2");

  const daycares = await requestJson(`${daycareUrl.pathname}${daycareUrl.search}`);
  if (!Array.isArray(daycares) || daycares.length !== 1) {
    throw new Error("Expected exactly one local 'Daycare de prueba' row; run the local seed first");
  }

  return daycares[0].id;
}

async function createOrReuseAuthUser() {
  const createPath = "/auth/v1/admin/users";
  const response = await fetch(endpoint(createPath), {
    method: "POST",
    redirect: "error",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...credentials, email_confirm: true }),
  });

  const responseText = await response.text();
  let responseBody;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = null;
  }

  if (response.ok) {
    const user = responseBody?.user ?? responseBody;
    if (!user?.id) {
      throw new Error("Auth Admin API did not return the created user's ID");
    }
    return { id: user.id, created: true };
  }

  if (response.status === 400 || response.status === 409 || response.status === 422) {
    const login = await requestJson("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: credentials,
    });
    if (login?.user?.id) {
      return { id: login.user.id, created: false };
    }
  }

  throw new Error(`Auth Admin API could not create the local staff user (HTTP ${response.status})`);
}

async function removeCreatedAuthUser(userId) {
  try {
    await requestJson(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  } catch {
    // Keep the original profile-creation error; never print API credentials or response bodies.
  }
}

async function main() {
  const daycareId = await findLocalDaycareId();
  const authUser = await createOrReuseAuthUser();

  try {
    const usersUrl = endpoint("/rest/v1/users");
    usersUrl.searchParams.set("on_conflict", "id");
    await requestJson(`${usersUrl.pathname}${usersUrl.search}`, {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: {
        id: authUser.id,
        daycare_id: daycareId,
        role: "staff",
        full_name: "Staff de prueba",
      },
    });
  } catch (error) {
    if (authUser.created) {
      await removeCreatedAuthUser(authUser.id);
    }
    throw error;
  }

  console.log("Local staff fixture is ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
