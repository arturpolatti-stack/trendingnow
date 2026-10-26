"use client";
import { startTransition, useActionState, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/server/actions";

/**
 * O React 19 limpa os campos após qualquer ação do formulário, inclusive com erro.
 * Enviamos manualmente para preservar o que a pessoa digitou quando a validação falha
 * e limpamos só quando `resetOnSuccess` é pedido.
 */
export function ActionForm({
  action, children, submit, className, resetOnSuccess = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submit: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      await formAction(data);
    });
  }

  // Limpa após sucesso quando solicitado (ex.: adicionar outra observação).
  useEffect(() => {
    if (resetOnSuccess && state.ok) ref.current?.reset();
  }, [resetOnSuccess, state]);

  return (
    <form ref={ref} method="post" onSubmit={onSubmit} className={className ?? "form"}>
      {children}
      {state.error && <p role="alert" className="error">{state.error}</p>}
      {state.ok && !pending && <p role="status" className="ok">Saved.</p>}
      <button type="submit" disabled={pending}>{pending ? "Saving…" : submit}</button>
    </form>
  );
}
