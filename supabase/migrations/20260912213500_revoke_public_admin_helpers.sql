-- Restrict internal SECURITY DEFINER helpers from all API roles.
revoke execute on function public.is_intil_admin() from public;
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.is_intil_admin() from anon, authenticated;
revoke execute on function public.rls_auto_enable() from anon, authenticated;
