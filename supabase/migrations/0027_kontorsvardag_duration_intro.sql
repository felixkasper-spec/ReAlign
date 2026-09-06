-- Change Kontorsvardag's opening sentence to lead with the actual duration
-- instead of "kort" (short). Applied live via Supabase (data change).

update public.programs set description =
'Ett 10 minuter långt program för dig som sitter mycket under dagen. Går att göra vid skrivbordet — ingen utrustning eller ombyte behövs.

När vi sitter mycket hamnar kroppen naturligt ur balans: rygg, nacke, axlar och höfter blir stela, och hållningsmuskler blir svaga.

Detta program syftar till att väcka dessa hållningsmuskler till liv så du kan hålla dig i balans trots mycket sittande, samt att göra själva sittandet i sig mycket mer behagligt och lättsamt.'
where slug = 'kontorsvardag';
