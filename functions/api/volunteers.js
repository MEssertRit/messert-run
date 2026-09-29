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

        } catch {
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

    if (request.method === "PUT") {
        try {
            const data = await request.json();

            const id = Number(data.id);
            const firstName = (data.first_name || "").trim();
            const lastName = (data.last_name || "").trim();
            const phone = (data.phone || "").trim();
            const notes = (data.notes || "").trim();

            if (!id || !firstName || !lastName) {
                return new Response(
                    JSON.stringify({ error: "Données obligatoires manquantes." }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            await env.DB.prepare(
                `UPDATE volunteers
                 SET first_name = ?, last_name = ?, phone = ?, notes = ?
                 WHERE id = ?`
            )
            .bind(firstName, lastName, phone, notes, id)
            .run();

            return new Response(
                JSON.stringify({ success: true }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        } catch {
            return new Response(
                JSON.stringify({ error: "Impossible de modifier le bénévole." }),
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
                    JSON.stringify({ error: "Identifiant du bénévole manquant." }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            await env.DB.prepare(
                "DELETE FROM volunteers WHERE id = ?"
            )
            .bind(id)
            .run();

            return new Response(
                JSON.stringify({ success: true }),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        } catch {
            return new Response(
                JSON.stringify({ error: "Impossible de supprimer le bénévole." }),
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
