import { createFileRoute } from "@tanstack/react-router";
import { ClienteForm } from "./clientes.novo";

export const Route = createFileRoute("/_authenticated/clientes/$id/editar")({ component: () => <ClienteForm id={Route.useParams().id} /> });
