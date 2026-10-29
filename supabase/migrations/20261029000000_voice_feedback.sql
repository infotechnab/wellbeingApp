-- Feedback from Profile (version 1.1.0): a written message of up to 200 words, a voice message of
-- up to 5 minutes, or both. Voice messages are files in the private feedback-audio storage bucket,
-- at <user id>/<feedback id>.<extension>, and audio_path names the file.

alter table public.feedback
  alter column message drop not null,
  drop constraint feedback_message_check,
  -- The app allows 200 words; this leaves room for long words.
  add constraint feedback_message_check check (char_length(message) between 1 and 2000),
  add column audio_path text,
  add column audio_duration_ms integer check (audio_duration_ms between 0 and 300000),
  add column app_version text,
  add column platform text,
  add constraint feedback_has_content check (message is not null or audio_path is not null);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback-audio', 'feedback-audio', false, 10485760, array['audio/*'])
on conflict (id) do nothing;

-- Guests and account holders can upload voice messages into their own folder. Nobody can list, play,
-- change or delete them from the app; the dashboard can.
create policy "Upload own voice feedback" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'feedback-audio' and (storage.foldername(name))[1] = (select auth.uid()::text));
