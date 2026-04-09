
-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete cleaners
CREATE POLICY "Admins can delete cleaners"
ON public.cleaners
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage user_roles (insert/delete)
CREATE POLICY "Admins can manage user_roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
