export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "GET") {
        const { results } = await env.DB.prepare(
            `SELECT
                id,
                title,
                category,
                race,
                location,
                start_time,
                end_time,
                people_needed,
                optional,
                instructions,
                latitude,
                longitude
             FROM missions
             ORDER BY start_time, title`
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

            const title = (data.title || "").trim();
            const category = (data.category || "").trim();
            const race = (data.race || "").trim();
            const location = (data.location || "").trim();
            const startTime = (data.start_time || "").trim();
            const endTime = (data.end_time || "").trim();
            const peopleNeeded = Number(data.people_needed) || 1;
            const optional = data.optional ? 1 : 0;
            const instructions = (data.instructions || "").trim();
            const latitude = data.latitude ?? null;
            const longitude = data.longitude ?? null;

            if (!title) {
                return new Response(
                    JSON.stringify({
                        error: "Le nom de la mission est obligatoire."
                    }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            const result = await env.DB.prepare(
                `INSERT INTO missions
                (
                    title,
                    category,
                    race,
                    location,
                    start_time,
                    end_time,
                    people_needed,
                    optional,
                    instructions,
                    latitude,
                    longitude
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
                title,
                category,
                race,
                location,
                startTime,
                endTime,
                peopleNeeded,
                optional,
                instructions,
                latitude,
                longitude
            )
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

        } catch {
            return new Response(
                JSON.stringify({
                    error: "Impossible de créer la mission."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }
    }

    if (request.method === "PUT") {
        try {
            const data = await request.json();

            const id = Number(data.id);
            const title = (data.title || "").trim();
            const category = (data.category || "").trim();
            const race = (data.race || "").trim();
            const location = (data.location || "").trim();
            const startTime = (data.start_time || "").trim();
            const endTime = (data.end_time || "").trim();
            const peopleNeeded = Number(data.people_needed) || 1;
            const optional = data.optional ? 1 : 0;
            const instructions = (data.instructions || "").trim();
            const latitude = data.latitude ?? null;
            const longitude = data.longitude ?? null;

            if (!id || !title) {
                return new Response(
                    JSON.stringify({
                        error: "Identifiant et nom de mission obligatoires."
                    }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            await env.DB.prepare(
                `UPDATE missions
                 SET
                    title = ?,
                    category = ?,
                    race = ?,
                    location = ?,
                    start_time = ?,
                    end_time = ?,
                    people_needed = ?,
                    optional = ?,
                    instructions = ?,
                    latitude = ?,
                    longitude = ?
                 WHERE id = ?`
            )
            .bind(
                title,
                category,
                race,
                location,
                startTime,
                endTime,
                peopleNeeded,
                optional,
                instructions,
                latitude,
                longitude,
                id
            )
            .run();

            return new Response(
                JSON.stringify({
                    success: true
                }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        } catch {
            return new Response(
                JSON.stringify({
                    error: "Impossible de modifier la mission."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }
    }

    if (request.method === "DELETE") {
        try {
            const data = await request.json();
            const id = Number(data.id);

            if (!id) {
                return new Response(
                    JSON.stringify({
                        error: "Identifiant de mission manquant."
                    }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            await env.DB.prepare(
                "DELETE FROM missions WHERE id = ?"
            )
            .bind(id)
            .run();

            return new Response(
                JSON.stringify({
                    success: true
                }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        } catch {
            return new Response(
                JSON.stringify({
                    error: "Impossible de supprimer la mission."
                }),
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
        JSON.stringify({
            error: "Méthode non autorisée."
        }),
        {
            status: 405,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}
