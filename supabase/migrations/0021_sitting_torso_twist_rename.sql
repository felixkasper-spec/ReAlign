-- Byter namn på övningen "Seated Trunk Rotation" till "Sitting Torso Twist".
update public.exercises
set title = 'Sitting Torso Twist'
where slug = 'seated-trunk-rotation';
