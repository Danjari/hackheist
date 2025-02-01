export async function POST(req) {
  try {
      const flaskBackendURL = "http://127.0.0.1:5050/api/describe";

      const requestBody = await req.json();
      console.log("📡 Sending request to Flask:", requestBody);

      const flaskResponse = await fetch(flaskBackendURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
      });

      if (!flaskResponse.ok) {
          const errorText = await flaskResponse.text();
          console.error("❌ Flask Error:", errorText);
          return new Response(JSON.stringify({ message: "Error from Flask", details: errorText }), {
              status: flaskResponse.status,
              headers: { "Content-Type": "application/json" },
          });
      }

      const data = await flaskResponse.json();
      console.log("✅ Flask Response Data:", data);

      return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
      });
  } catch (error) {
      console.error("❌ Error connecting to Flask:", error);
      return new Response(JSON.stringify({ message: "Server error", details: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
      });
  }
}