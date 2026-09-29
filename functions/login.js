export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const data = await request.json();
        const identifiant = (data.identifiant || "").trim();

        if (identifiant === env.COMITE_ID) {
            return new Response(JSON.stringify({
                success: true,
                role: "comite"
            }), {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }

        if (identifiant === env.BENEVOLE_ID) {
            return new Response(JSON.stringify({
                success: true,
                role: "benevole"
            }), {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }

        return new Response(JSON.stringify({
            success: false,
            message: "Identifiant incorrect."
        }), {
            status: 401,
            headers: {
                "Content-Type": "application/json"
            }
        });

    } catch {
        return new Response(JSON.stringify({
            success: false,
            message: "Requête invalide."
        }), {
            status: 400,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
