export async function POST(req) {
    try {
        const flaskBackendURL = "http://127.0.0.1:5050/api/checkForNearBy"; // Flask API

        const requestBody = await req.json(); // Get request body (frame)

        const flaskResponse = await fetch(flaskBackendURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!flaskResponse.ok) {
            return new Response(JSON.stringify({ message: "Error from Flask" }), {
                status: flaskResponse.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        const data = await flaskResponse.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error connecting to Flask:", error);
        return new Response(JSON.stringify({ message: "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function GET() {
    return new Response(JSON.stringify({ message: "Use POST method to access this API" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
    });
}