export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "GET") {
        const { results } = await env.DB.prepare(
            "SELECT id, first_name, last_name, phone, notes FROM volunteers ORDER BY last_name, first_name"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    if (request.method === "POST") {
        try {
            const data = await request.json();

            const firstName = (data.first_name || "").trim();
            const lastName = (data.last_name || "").trim();
            const phone = (data.phone || "").trim();
            const notes = (data.notes || "").trim();

            if (!firstName || !lastName) {
                return new Response(
                    JSON.stringify({ error: "Prénom et nom obligatoires." }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            const result = await env.DB.prepare(
                `INSERT INTO volunteers
                (first_name, last_name, phone, notes)
                VALUES (?, ?, ?, ?)`
            )
            .bind(firstName, lastName, phone, notes)
            .run();

            return new Response(
                JSON.stringify({
                    success: true,
                    id: result.meta.last_row_id
                }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        } catch (error) {
            return new Response(
                JSON.stringify({ error: "Données invalides." }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }
    }

    return new Response(
        JSON.stringify({ error: "Méthode non autorisée." }),
        {
            status: 405,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}
