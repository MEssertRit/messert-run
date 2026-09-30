export async function onRequest(context) {
    const { request, env } = context;

    // Voir toutes les affectations avec les noms des bénévoles
    if (request.method === "GET") {
        const { results } = await env.DB.prepare(
            `SELECT
                assignments.id,
                assignments.mission_id,
                assignments.volunteer_id,
                volunteers.first_name,
                volunteers.last_name
             FROM assignments
             JOIN volunteers
                ON volunteers.id = assignments.volunteer_id
             ORDER BY assignments.mission_id, volunteers.last_name, volunteers.first_name`
        ).all();

        return new Response(JSON.stringify(results), {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    // Affecter un bénévole à une mission
    if (request.method === "POST") {
        try {
            const data = await request.json();

            const missionId = Number(data.mission_id);
            const volunteerId = Number(data.volunteer_id);

            if (!missionId || !volunteerId) {
                return new Response(
                    JSON.stringify({
                        error: "Mission et bénévole obligatoires."
                    }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            const existing = await env.DB.prepare(
    `SELECT id
     FROM assignments
     WHERE mission_id = ? AND volunteer_id = ?`
)
.bind(missionId, volunteerId)
.first();

if (existing) {
    return new Response(
        JSON.stringify({
            error: "Ce bénévole est déjà affecté à cette mission."
        }),
        {
            status: 409,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}

await env.DB.prepare(
    `INSERT INTO assignments
    (mission_id, volunteer_id)
    VALUES (?, ?)`
)
.bind(missionId, volunteerId)
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
                    error: "Impossible de créer l'affectation."
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

    // Supprimer une affectation
    if (request.method === "DELETE") {
        try {
            const data = await request.json();

            const id = Number(data.id);

            if (!id) {
                return new Response(
                    JSON.stringify({
                        error: "Identifiant d'affectation manquant."
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
                "DELETE FROM assignments WHERE id = ?"
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
                    error: "Impossible de supprimer l'affectation."
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
