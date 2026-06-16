alter type public.variant_format add value if not exists 'digital_pdf';
alter type public.variant_format add value if not exists 'digital_epub';
alter type public.variant_format add value if not exists 'digital_bundle';

comment on type public.variant_format is
  'Book and claimable variant formats. digital_pdf, digital_epub and digital_bundle are used for the digital-book MVP.';
