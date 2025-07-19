import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createSupabaseClient = (accessToken?: string) => {
  // Create the client with minimal configuration first
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  // CRITICAL: Set the auth token for realtime AFTER client creation
  if (accessToken) {
    client.realtime.setAuth(accessToken);
  }

  return client;
};

// Alternative approach: Create client with proper auth headers
// export const createSupabaseClientWithHeaders = (accessToken?: string) => {
//   const headers: Record<string, string> = {};

//   if (accessToken) {
//     headers.Authorization = `Bearer ${accessToken}`;
//     headers.apikey = supabaseAnonKey;
//   }

//   const client = createClient(supabaseUrl, supabaseAnonKey, {
//     realtime: {
//       params: {
//         eventsPerSecond: 10,
//       },
//       headers: accessToken
//         ? {
//             Authorization: `Bearer ${accessToken}`,
//             apikey: supabaseAnonKey,
//           }
//         : undefined,
//     },
//     auth: {
//       persistSession: false,
//       autoRefreshToken: false,
//       detectSessionInUrl: false,
//       storageKey: undefined,
//     },
//     global: {
//       headers,
//     },
//   });

//   // STILL NEED THIS for realtime to work properly with RLS
//   if (accessToken) {
//     client.realtime.setAuth(accessToken);
//   }

//   return client;
// };
// Debug function to test JWT token structure and RLS
// export const debugSupabaseConnection = async (accessToken: string) => {
//   const client = createSupabaseClient(accessToken);

//   try {
//     // Test JWT parsing
//     const payload = JSON.parse(atob(accessToken.split(".")[1]));
//     console.log("JWT Payload:", payload);

//     // Test notification query with RLS
//     const { data, error } = await client
//       .from("Notification")
//       .select("*")
//       .limit(1);

//     console.log("Notification query result:", { data, error });

//     // Test RLS function
//     const { data: debugData, error: debugError } = await client.rpc(
//       "requesting_user_id"
//     );

//     console.log("User ID from RLS function:", debugData);

//     return { payload, data, error, debugData, debugError };
//   } catch (error) {
//     console.error("Connection test failed:", error);
//     return { error };
//   }
// };
