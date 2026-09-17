update public.ticket_types tt
set description = case tt.code
  when 'GENERAL' then 'Balcony admission with automatic physical seat allocation'
  when 'PREMIUM' then 'ODC admission in Blocks A or E with automatic physical seat allocation'
  when 'VIP' then 'ODC admission in Blocks B, C or D with automatic physical seat allocation'
  else tt.description
end,
benefits = case tt.code
  when 'GENERAL' then array[
    'Balcony seating in Blocks F–H',
    'Automatic physical seat allocation',
    'Secure digital QR admission'
  ]::text[]
  when 'PREMIUM' then array[
    'ODC seating in Blocks A or E',
    'Automatic physical seat allocation',
    'Secure digital QR admission'
  ]::text[]
  when 'VIP' then array[
    'ODC seating in Blocks B, C or D',
    'Automatic physical seat allocation',
    'Secure digital QR admission'
  ]::text[]
  else tt.benefits
end,
updated_at = now()
from public.events e
where tt.event_id = e.id
  and e.slug = 'swara-ranjana-2026'
  and tt.code in ('GENERAL','PREMIUM','VIP');
