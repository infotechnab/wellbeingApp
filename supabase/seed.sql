-- Generated from src/content by `npm run seed:generate`. Do not edit by hand.

insert into public.emotions (id, name, theme, need, body_response, color, sort_order) values
  ('joy', 'Joy', 'I feel good and want to enjoy or share this moment.', 'Savoring, connection', 'Social engagement (regulated nervous system)', '#F7DC8C', 0),
  ('trust', 'Trust', 'I feel safe and comfortable with someone or something.', 'Safety, bonding', 'Social engagement / healthy connection', '#BFE3B4', 1),
  ('fear', 'Fear', 'Something feels unsafe and I want to protect myself.', 'Safety, grounding', 'Flight', '#9FD1C0', 2),
  ('surprise', 'Surprise', 'Something unexpected just happened and I need a moment to make sense of it.', 'Orientation, clarity', 'Brief freeze', '#A9D8EC', 3),
  ('sadness', 'Sadness', 'I feel low or hurt and need comfort or support.', 'Comfort, compassion', 'Freeze / withdrawal', '#B4C6EC', 4),
  ('disgust', 'Disgust', 'Something feels wrong or unpleasant and I want to move away.', 'Boundaries, protection', 'Rejection / avoidance', '#D3BFE6', 5),
  ('anger', 'Anger', 'Something feels unfair or upsetting and I want it to change.', 'Justice, expression', 'Fight', '#F4B3A9', 6),
  ('anticipation', 'Anticipation', 'Something is coming and I’m preparing or thinking about what’s next.', 'Direction, preparation', 'Mild activation', '#F7C9A0', 7),
  ('confused', 'Not sure', 'I’m confused, or I don’t want to say right now. That’s okay.', 'Clarity, grounding, gentle understanding', 'Mental overload / scattered attention', '#E7E2DA', 8)
on conflict (id) do update set name = excluded.name, theme = excluded.theme, need = excluded.need, body_response = excluded.body_response, color = excluded.color, sort_order = excluded.sort_order;

insert into public.activities (id, emotion_id, sort_order, kind, title, instruction, duration_sec, breath, steps, templates, placeholder, research) values
  ('joy-savoring-breath', 'joy', 0, 'breath', 'Savoring Breath', 'Take 3 slow breaths while noticing one pleasant sensation in your body.', null, '{"inhaleSec":4,"exhaleSec":6,"rounds":3}'::jsonb, null, null, null, 'Savoring positive emotion increases wellbeing and emotional resilience.'),
  ('joy-share-moment', 'joy', 1, 'share', 'Share the Moment', 'Send a short appreciation message to someone. Pick one, make it yours, and share it.', null, null, null, '["I was just thinking of you and wanted to say thank you for being in my life.","Something good happened today and you were the first person I wanted to tell.","I really appreciate the way you always make time for me.","You made my day better, and I wanted you to know.","Thank you for your kindness. It meant more than you know."]'::jsonb, null, 'Social sharing strengthens positive feelings and relational bonding.'),
  ('joy-share-energy', 'joy', 2, 'prompt', 'Share the Energy', 'Simply appreciate someone or something nearby.', 30, null, null, null, null, null),
  ('joy-smile-relaxation', 'joy', 3, 'timer', 'Smile Relaxation', 'Gently smile (a fake smile works too) for 20 seconds and soften your shoulders.', 20, null, null, null, null, 'Facial feedback influences how we experience emotion.'),
  ('trust-hand-on-heart', 'trust', 0, 'breath', 'Hand-on-Heart Breathing', 'Place your right hand on your chest and breathe slowly for 5 breaths.', null, '{"inhaleSec":5,"exhaleSec":5,"rounds":5}'::jsonb, null, null, null, 'Self-touch activates parasympathetic calming.'),
  ('trust-connection-recall', 'trust', 1, 'prompt', 'Connection Recall', 'Think of one person who supports you and recall a moment with them.', 45, null, null, null, null, 'Recalling secure attachments increases emotional security.'),
  ('trust-eye-softening', 'trust', 2, 'timer', 'Eye Softening', 'Relax your eyes and soften your gaze for 20 seconds.', 20, null, null, null, null, 'A soft gaze activates the social safety system.'),
  ('fear-long-exhale', 'fear', 0, 'breath', 'Long Exhale Breathing', 'Inhale for 4 seconds, exhale for 6 seconds, for 5 rounds.', null, '{"inhaleSec":4,"exhaleSec":6,"rounds":5}'::jsonb, null, null, null, 'A longer exhale stimulates the vagus nerve.'),
  ('fear-5-4-3', 'fear', 1, 'grounding', '5-4-3 Grounding', 'Name 5 things you see, 4 you feel, and 3 you hear.', null, null, '["5 things you can see","4 things you can feel","3 things you can hear"]'::jsonb, null, null, 'Grounding reduces amygdala activation and anxiety.'),
  ('fear-foot-press', 'fear', 2, 'timer', 'Foot Press Grounding', 'Press your feet firmly into the floor for 15 seconds.', 15, null, null, null, null, 'Pressure input through the body stabilises nervous system regulation.'),
  ('surprise-orienting', 'surprise', 0, 'timer', 'Orienting Look Around', 'Slowly turn your head and look around the room.', 30, null, null, null, null, 'The orienting response helps the brain check that you are safe.'),
  ('surprise-three-breaths', 'surprise', 1, 'breath', 'Three Slow Breaths', 'Pause and take three deliberate breaths.', null, '{"inhaleSec":4,"exhaleSec":5,"rounds":3}'::jsonb, null, null, null, 'Brief breath regulation restores cognitive control.'),
  ('surprise-name-it', 'surprise', 2, 'prompt', 'Name What Happened', 'Say silently: “Something unexpected happened.”', 15, null, null, null, null, 'Putting feelings into words reduces limbic activation.'),
  ('sadness-self-compassion', 'sadness', 0, 'prompt', 'Self-Compassion Phrase', 'Say to yourself: “This is a difficult moment.”', 20, null, null, null, null, 'Self-compassion reduces emotional distress.'),
  ('sadness-self-hug', 'sadness', 1, 'timer', 'Gentle Self-Hug', 'Cross your arms and gently squeeze your shoulders for 20 seconds.', 20, null, null, null, null, 'Self-soothing touch lowers cortisol.'),
  ('sadness-rocking', 'sadness', 2, 'timer', 'Slow Rocking Movement', 'Gently sway or rock your body slowly.', 30, null, null, null, null, 'Rhythmic movement regulates emotional distress.'),
  ('disgust-step-back', 'disgust', 0, 'timer', 'Physical Step Back', 'Take two steps away from whatever is bothering you.', 10, null, null, null, null, 'Physical distance reduces emotional reactivity.'),
  ('disgust-hand-shake', 'disgust', 1, 'timer', 'Hand Shake Release', 'Shake your hands lightly for 15 seconds.', 15, null, null, null, null, 'Shaking releases tension from the nervous system.'),
  ('disgust-boundary', 'disgust', 2, 'prompt', 'Boundary Statement', 'Say silently: “I can step away from this.”', 15, null, null, null, null, 'Boundary statements reduce the stress response.'),
  ('anger-fist-release', 'anger', 0, 'breath', 'Fist Clench and Release', 'Clench your fists for 5 seconds, then release slowly. Repeat 3 times.', null, '{"inhaleSec":5,"exhaleSec":5,"rounds":3}'::jsonb, null, null, null, 'Tensing and releasing muscles reduces physical tension.'),
  ('anger-power-exhale', 'anger', 1, 'breath', 'Power Exhale', 'Inhale through your nose, then exhale forcefully through your mouth. Repeat 5 times.', null, '{"inhaleSec":3,"exhaleSec":2,"rounds":5}'::jsonb, null, null, null, null),
  ('anger-wall-push', 'anger', 2, 'timer', 'Wall Push', 'Place your hands on a wall and push firmly for 10 seconds.', 10, null, null, null, null, 'Isometric pressure discharges fight energy safely.'),
  ('anticipation-next-step', 'anticipation', 0, 'write', 'Next Step Write', 'Write the smallest possible next step.', null, null, null, null, 'My next small step is…', 'Mental rehearsal improves motivation and performance.'),
  ('anticipation-visualization', 'anticipation', 1, 'timer', 'Future Visualization', 'Close your eyes and imagine completing the next task.', 30, null, null, null, null, 'Mental rehearsal improves motivation and performance.'),
  ('anticipation-focus-breath', 'anticipation', 2, 'breath', 'Focus Breath', 'Take 4 slow breaths while thinking about your goal.', null, '{"inhaleSec":4,"exhaleSec":4,"rounds":4}'::jsonb, null, null, null, null),
  ('confused-pause-breathe', 'confused', 0, 'breath', 'Pause & Breathe', 'Take a slow breath in… and a longer breath out. Repeat 5 times.', null, '{"inhaleSec":4,"exhaleSec":6,"rounds":5}'::jsonb, null, null, null, 'Slowing the breath supports nervous system regulation.'),
  ('confused-name-one-thing', 'confused', 1, 'prompt', 'Name One Small Thing', 'Gently ask: “What am I noticing right now?” Name just one thing: a body feeling, a thought, or a feeling.', 30, null, null, null, null, null),
  ('confused-simple-grounding', 'confused', 2, 'grounding', 'Simple Grounding', 'Look around and notice what is here with you.', null, null, '["3 things you can see","2 things you can feel","1 thing you can hear"]'::jsonb, null, null, 'Grounding attention helps the brain move from confusion toward clarity.'),
  ('confused-focus-dot', 'confused', 3, 'focus-dot', 'Dot on a White Screen', 'Look at the dot for 30 seconds.', 30, null, null, null, null, null)
on conflict (id) do update set emotion_id = excluded.emotion_id, sort_order = excluded.sort_order, kind = excluded.kind, title = excluded.title, instruction = excluded.instruction, duration_sec = excluded.duration_sec, breath = excluded.breath, steps = excluded.steps, templates = excluded.templates, placeholder = excluded.placeholder, research = excluded.research;

delete from public.affirmations;
insert into public.affirmations (text) values
  ('You are allowed to take things one small step at a time.'),
  ('Whatever you feel right now is welcome here.'),
  ('You have handled hard days before, and you can handle this one.'),
  ('Breathing slowly is already an act of care.'),
  ('You don’t have to have it all figured out today.'),
  ('Small steps still move you forward.'),
  ('Your feelings are information, not a verdict.'),
  ('Rest is part of the work, not a break from it.'),
  ('You deserve the same kindness you give to others.'),
  ('This moment is enough, and so are you.'),
  ('It’s okay to pause before you respond.'),
  ('You can be a work in progress and still be whole.'),
  ('Notice one good thing. It counts.'),
  ('Gentle is still strong.'),
  ('You are not alone in feeling this way.');
