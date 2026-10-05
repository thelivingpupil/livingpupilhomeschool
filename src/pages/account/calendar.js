import { useMemo, useState } from 'react';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { getSession } from 'next-auth/react';
import { InvitationStatus } from '@prisma/client';
import {
  CalendarIcon,
  ClockIcon,
  LocationMarkerIcon,
  SearchIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';

import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import sanityClient, { imageBuilder } from '@/lib/server/sanity';
import ImageModal from '@/components/Modal/Image-Modal';
import prisma from '@/prisma/index';

const PRIORITY_SCHOOL_YEAR = '2026-2027';

const AUDIENCE_LABELS = {
  parents: 'Parents',
  students: 'Students',
  families: 'Families',
  community: 'Community',
};

const AUDIENCE_STYLES = {
  parents: 'bg-primary-100 text-primary-700',
  students: 'bg-emerald-100 text-emerald-800',
  families: 'bg-orange-100 text-orange-800',
  community: 'bg-secondary-200 text-secondary-800',
};

const DISTRICT_LABELS = {
  MAGITING: 'Magiting',
  MAHARLIKA: 'Maharlika',
  BULACAN: 'Bulacan',
  GREATER_MANILA: 'Luzon (Greater Manila)',
  BAYANI: 'Bayani',
  MASINAG: 'Masinag',
  MARANGAL: 'Marangal',
  BICOL: 'Bicol',
  CEBU_SOUTH: 'Cebu South',
  CEBU_NORTH: 'Cebu North',
  CEBU_VISAYAS: '(Cebu)/Visayas',
  ILOILO: 'Iloilo',
  CEBU_CENTRAL: 'Cebu Central',
  BOHOL: 'Bohol',
  NEGROS: 'Negros Island',
  LEYTE: 'Leyte',
  DAVAO: 'Davao',
  MINDANAO: 'Mindanao',
  MISAMIS_OCCIDENTAL: 'Misamis Occidental',
  ILIGAN_MISAMIS_ORIENTAL: 'Iligan – Misamis Oriental',
  ZAMBOANGA: 'Zamboanga',
  SOCCSKSARGEN: 'SOCCSKSARGEN',
  BUKIDNON_CDO: 'Bukidnon – CDO',
  CEBU: 'Cebu',
  LUZON: 'Luzon',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'online', label: 'Online' },
  { id: 'cottage', label: 'Cottage Class' },
  { id: 'students', label: 'Students' },
  { id: 'parents', label: 'Parents' },
  { id: 'community', label: 'Community' },
  { id: 'district', label: 'District Events' },
];

const AREA_DISTRICT = {
  south: 'CEBU_SOUTH',
  central: 'CEBU_CENTRAL',
  north: 'CEBU_NORTH',
  bayani: 'BAYANI',
  magiting: 'MAGITING',
  maharlika: 'MAHARLIKA',
  marangal: 'MARANGAL',
  masinag: 'MASINAG',
  bulacan: 'BULACAN',
  bicol: 'BICOL',
  'greater-manila': 'GREATER_MANILA',
  iloilo: 'ILOILO',
  bohol: 'BOHOL',
  negros: 'NEGROS',
  leyte: 'LEYTE',
  soccsksargen: 'SOCCSKSARGEN',
  'bukidnon-cdo': 'BUKIDNON_CDO',
  'misamis-occidental': 'MISAMIS_OCCIDENTAL',
  zamboanga: 'ZAMBOANGA',
  davao: 'DAVAO',
  'iligan-misamis-oriental': 'ILIGAN_MISAMIS_ORIENTAL',
  mindanao: 'MINDANAO',
};

const CEBU_GROUPS = new Set([
  'CEBU',
  'CEBU_SOUTH',
  'CEBU_NORTH',
  'CEBU_CENTRAL',
  'CEBU_VISAYAS',
]);
const LUZON_GROUPS = new Set([
  'LUZON',
  'MAGITING',
  'MAHARLIKA',
  'BULACAN',
  'GREATER_MANILA',
  'BAYANI',
  'MASINAG',
  'MARANGAL',
  'BICOL',
]);
const MINDANAO_GROUPS = new Set([
  'MINDANAO',
  'DAVAO',
  'MISAMIS_OCCIDENTAL',
  'ILIGAN_MISAMIS_ORIENTAL',
  'ZAMBOANGA',
  'SOCCSKSARGEN',
  'BUKIDNON_CDO',
]);

const posterUrl = (poster) => {
  if (!poster?.asset) return null;
  const imageAsset = imageBuilder.image(poster);
  return imageAsset?.options?.source ? imageAsset.url() : null;
};

const plainText = (value) => {
  if (!Array.isArray(value)) return '';
  return value
    .map((block) =>
      (block.children || []).map((child) => child.text || '').join(''),
    )
    .join(' ');
};

const normalizeDistrict = (value) => {
  const key = String(value || '')
    .trim()
    .toUpperCase();
  return DISTRICT_LABELS[key] ? key : null;
};

const inferAudience = (event) => {
  const explicit = String(event.audience || '')
    .trim()
    .toLowerCase();
  if (AUDIENCE_LABELS[explicit]) return explicit;
  const text = `${event.title || ''} ${(event.joiners || []).join(' ')}`.toLowerCase();
  if (text.includes('community')) return 'community';
  if (text.includes('famil')) return 'families';
  if (/parent|moms|mom\b|dad\b/.test(text)) return 'parents';
  if (/student|grade|form|youth/.test(text)) return 'students';
  return null;
};

const inferDistrict = (event) => {
  const explicit = normalizeDistrict(event.district);
  if (explicit) return explicit;
  const area = String(event.area || '')
    .trim()
    .toLowerCase();
  if (AREA_DISTRICT[area]) return AREA_DISTRICT[area];
  const text = `${event.title || ''} ${(event.joiners || []).join(' ')} ${event.venue || ''}`.toLowerCase();
  if (/\bcebu\b/.test(text)) return 'CEBU';
  if (/\bluzon\b/.test(text)) return 'LUZON';
  if (/\bmindanao\b/.test(text)) return 'MINDANAO';
  return null;
};

const eventText = (event) =>
  `${event.title || ''} ${(event.joiners || []).join(' ')} ${event.venue || ''} ${event.maplink || ''} ${plainText(event.description)}`.toLowerCase();

const isOnlineEvent = (event) => {
  const format = String(event.classFormat || '').toLowerCase();
  if (format === 'online') return true;
  if ((event.types || []).includes('ONLINE')) return true;
  const text = eventText(event);
  return text.includes('zoom') || text.includes('online');
};

const isCottageEvent = (event) => {
  const format = String(event.classFormat || '').toLowerCase();
  if (format === 'cottage') return true;
  return eventText(event).includes('cottage');
};

const formatManilaDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatManilaTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const isDateOnly = (value) =>
  typeof value === 'string' && /T00:00:00(\.000)?Z$/.test(value);

const eventTimestamp = (event) => {
  const value = event.startDate || event.dateandtime?.[0];
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const scheduleText = (event) => {
  if (event.scheduleLabel) return event.scheduleLabel;
  if (event.startDate) {
    const start = formatManilaDate(event.startDate);
    const end =
      event.endDate && event.endDate !== event.startDate
        ? formatManilaDate(event.endDate)
        : '';
    return end ? `${start} – ${end}` : start;
  }
  const dates = event.dateandtime || [];
  if (!dates.length) return 'Schedule to be announced';
  const start = formatManilaDate(dates[0]);
  const end =
    dates.length > 1 ? formatManilaDate(dates[dates.length - 1]) : '';
  return end && end !== start ? `${start} – ${end}` : start;
};

const timeText = (event) => {
  if (event.startTime && event.endTime) {
    return `${event.startTime} – ${event.endTime}`;
  }
  if (event.startTime) return event.startTime;
  const value = event.dateandtime?.[0];
  if (!value || isDateOnly(value)) return '';
  return formatManilaTime(value);
};

const venueText = (event) => {
  if (event.venue) return event.venue;
  const link = String(event.maplink || '').toLowerCase();
  const online = (event.types || []).includes('ONLINE') || link.includes('zoom');
  if (online) return 'Zoom (Online)';
  if (event.maplink) return 'See map';
  return 'Venue to be announced';
};

const manilaDateKey = (value) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));

const isFinished = (event) => {
  const dated = [...(event.dateandtime || []), event.endDate || event.startDate].filter(
    Boolean,
  );
  if (!dated.length) return false;
  const last = dated.reduce((latest, value) => {
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return latest;
    if (!latest) return value;
    return time > new Date(latest).getTime() ? value : latest;
  }, null);
  if (!last) return false;
  const dateOnly =
    isDateOnly(last) ||
    (typeof last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(last));
  if (dateOnly) return manilaDateKey(last) < manilaDateKey(new Date());
  const time = new Date(last).getTime();
  return time < Date.now();
};

const sameDistrictScope = (eventDistrict, studentDistrict) => {
  if (eventDistrict === studentDistrict) return true;
  if (CEBU_GROUPS.has(eventDistrict) && CEBU_GROUPS.has(studentDistrict)) return true;
  if (eventDistrict === 'LUZON' && LUZON_GROUPS.has(studentDistrict)) return true;
  if (eventDistrict === 'MINDANAO' && MINDANAO_GROUPS.has(studentDistrict)) return true;
  return false;
};

const visibleToFamily = (event, studentDistricts) => {
  if (!event.districtKey) return true;
  return studentDistricts.some((district) =>
    sameDistrictScope(event.districtKey, district),
  );
};

const familyScopeLabel = (studentDistricts) => {
  const labels = [];
  if (studentDistricts.some((district) => CEBU_GROUPS.has(district))) {
    labels.push('North, Central, and South Cebu');
  }
  studentDistricts.forEach((district) => {
    if (CEBU_GROUPS.has(district)) return;
    if (DISTRICT_LABELS[district]) labels.push(DISTRICT_LABELS[district]);
  });
  return labels.join(' and ');
};

const Calendar = ({ events, calendarPage, studentDistricts }) => {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);

  const prepared = useMemo(
    () =>
      (events || []).map((event) => ({
        ...event,
        audience: inferAudience(event),
        districtKey: inferDistrict(event),
        online: isOnlineEvent(event),
        cottage: isCottageEvent(event),
        posterUrl: posterUrl(event.poster),
        schedule: scheduleText(event),
        time: timeText(event),
        venueLabel: venueText(event),
      })),
    [events],
  );

  const current = useMemo(
    () =>
      prepared.filter(
        (event) =>
          !isFinished(event) && visibleToFamily(event, studentDistricts),
      ),
    [prepared, studentDistricts],
  );

  const featured = useMemo(() => {
    const flagged = current
      .filter((event) => event.featured)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
    if (flagged.length) return flagged.slice(0, 4);
    return current
      .filter((event) => eventTimestamp(event))
      .sort((a, b) => eventTimestamp(a) - eventTimestamp(b))
      .slice(0, 4);
  }, [current]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return current
      .filter((event) => {
        if (filter === 'district') {
          if (!event.districtKey || !studentDistricts.includes(event.districtKey)) {
            return false;
          }
        } else if (filter === 'online' && !event.online) {
          return false;
        } else if (filter === 'cottage' && !event.cottage) {
          return false;
        } else if (
          filter !== 'all' &&
          filter !== 'online' &&
          filter !== 'cottage' &&
          event.audience !== filter
        ) {
          return false;
        }
        if (!needle) return true;
        const haystack = [
          event.title,
          event.venueLabel,
          event.schedule,
          (event.joiners || []).join(' '),
          plainText(event.description),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) => {
        const aTime = eventTimestamp(a);
        const bTime = eventTimestamp(b);
        if (aTime === null) return 1;
        if (bTime === null) return -1;
        return aTime - bTime;
      });
  }, [current, filter, query, studentDistricts]);

  const districtNames = studentDistricts
    .map((district) => DISTRICT_LABELS[district])
    .filter(Boolean);

  const showDistrictEvents = () => {
    setFilter('district');
    document.getElementById('all-events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - School Calendar" />
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Content.Title
          title="Calendar of Events"
          subtitle={
            calendarPage?.subtitle ||
            'Stay connected with our upcoming learning, family, and community activities.'
          }
        />
        <div className="rounded-2xl bg-primary-600 px-5 py-4 text-white md:max-w-xs">
          <p className="font-display text-xl leading-tight text-secondary-300">
            Learn. Connect. Grow. Together.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary-600">Featured Events</h2>
          <button
            type="button"
            className="text-sm font-semibold text-primary-600"
            onClick={() => {
              setFilter('all');
              setQuery('');
              document.getElementById('all-events')?.scrollIntoView({
                behavior: 'smooth',
              });
            }}
          >
            View all events
          </button>
        </div>
        {featured.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                expanded={expandedEventId === event._id}
                onToggle={() =>
                  setExpandedEventId(
                    expandedEventId === event._id ? null : event._id,
                  )
                }
                onImageClick={setExpandedImage}
              />
            ))}
          </div>
        ) : (
          <Content.Empty>No featured events yet.</Content.Empty>
        )}
      </section>

      <section id="all-events" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                  filter === item.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-primary-600 ring-1 ring-primary-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <label className="relative">
              <span className="sr-only">Search events</span>
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events"
                className="w-full rounded-full border border-gray-200 py-1 pl-8 pr-3 text-xs sm:w-44"
              />
            </label>
          </div>
        </div>

        {filter === 'all' && (
          <p className="text-sm text-gray-500">
            {districtNames.length
              ? `LP events for everyone, plus ${familyScopeLabel(studentDistricts)}.`
              : 'LP events for everyone. District events appear once a 2026–2027 district is saved.'}
          </p>
        )}
        {filter === 'district' && districtNames.length > 0 && (
          <p className="text-sm text-gray-500">
            Showing {familyScopeLabel(studentDistricts)} only.
          </p>
        )}
        {filter === 'district' && districtNames.length === 0 && (
          <p className="text-sm text-gray-500">
            A district has not been saved for your 2026–2027 student yet.
          </p>
        )}

        {visible.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                expanded={expandedEventId === event._id}
                onToggle={() =>
                  setExpandedEventId(
                    expandedEventId === event._id ? null : event._id,
                  )
                }
                onImageClick={setExpandedImage}
              />
            ))}
          </div>
        ) : (
          <Content.Empty>No events match this view.</Content.Empty>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl bg-primary-600 p-5 text-white">
          <CalendarIcon className="mb-3 h-8 w-8 text-secondary-300" />
          <h3 className="text-lg font-bold">
            {calendarPage?.calendarSubscribeLabel ||
              'Subscribe to the LP Manila Google Calendar'}
          </h3>
          <p className="mt-2 text-sm text-primary-100">
            {calendarPage?.calendarSubscribeText ||
              'Get the latest updates on events, activities, and important dates.'}
          </p>
          {calendarPage?.calendarSubscribeUrl && (
            <a
              href={calendarPage.calendarSubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-600"
            >
              Subscribe now
            </a>
          )}
        </article>
        <article className="rounded-2xl border bg-white p-5">
          <UserGroupIcon className="mb-3 h-8 w-8 text-primary-600" />
          <h3 className="text-lg font-bold text-primary-700">
            {calendarPage?.communityTitle || 'Be Part of Our Community'}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {calendarPage?.communityText ||
              'Join our LP community, volunteer opportunities, family events, and more!'}
          </p>
          <a
            href="/account/community"
            className="mt-4 inline-flex rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {calendarPage?.communityButtonLabel || 'View Community Events'}
          </a>
        </article>
        <article className="rounded-2xl border bg-white p-5">
          <LocationMarkerIcon className="mb-3 h-8 w-8 text-primary-600" />
          <h3 className="text-lg font-bold text-primary-700">
            {calendarPage?.districtTitle || 'Explore District Events'}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {calendarPage?.districtText ||
              'Check out events happening in our Cebu, Luzon, and Mindanao districts.'}
          </p>
          <button
            type="button"
            onClick={showDistrictEvents}
            className="mt-4 inline-flex rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {calendarPage?.districtButtonLabel || 'View District Events'}
          </button>
        </article>
      </section>

      {expandedImage && (
        <ImageModal imageUrl={expandedImage} onClose={() => setExpandedImage(null)} />
      )}
    </AccountLayout>
  );
};

const EventCard = ({ event, expanded, onToggle, onImageClick }) => (
  <article className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
    <button
      type="button"
      className="relative h-40 w-full bg-gray-50"
      onClick={() => event.posterUrl && onImageClick(event.posterUrl)}
    >
      <Image
        alt={event.title || 'Event poster'}
        src={event.posterUrl || '/images/livingpupil-homeschool-logo.png'}
        layout="fill"
        objectFit="cover"
      />
    </button>
    <div className="flex flex-1 flex-col gap-2 p-4">
      {event.audience && (
        <span
          className={`w-fit rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wide ${AUDIENCE_STYLES[event.audience]}`}
        >
          {AUDIENCE_LABELS[event.audience]}
        </span>
      )}
      <h3 className="font-bold text-gray-900">{event.title}</h3>
      <p className="flex items-start gap-2 text-sm text-gray-600">
        <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
        <span>{event.schedule}</span>
      </p>
      {event.time && (
        <p className="flex items-start gap-2 text-sm text-gray-600">
          <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
          <span>{event.time}</span>
        </p>
      )}
      <p className="flex items-start gap-2 text-sm text-gray-600">
        <LocationMarkerIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
        {event.maplink ? (
          <a
            href={event.maplink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {event.venueLabel}
          </a>
        ) : (
          <span>{event.venueLabel}</span>
        )}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="mt-auto rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
      >
        {expanded ? 'Hide Details' : 'View Details'}
      </button>
      {expanded && <EventDetails event={event} />}
    </div>
  </article>
);

const EventDetails = ({ event }) => (
  <div className="space-y-3 border-t pt-3 text-sm text-gray-600">
    {event.description && <PortableText value={event.description} />}
    {event.districtKey && (
      <p>
        <span className="font-semibold text-gray-800">District: </span>
        {DISTRICT_LABELS[event.districtKey]}
        {event.area ? ` · ${event.area}` : ''}
      </p>
    )}
    {event.joiners?.filter(Boolean).length > 0 && (
      <p>
        <span className="font-semibold text-gray-800">Who can join: </span>
        {event.joiners.filter(Boolean).join(', ')}
      </p>
    )}
    {event.link && (
      <p>
        <span className="font-semibold text-gray-800">Registration: </span>
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-primary-600 underline"
        >
          {event.link}
        </a>
      </p>
    )}
    {event.eventFile?.url && (
      <a
        href={event.eventFile.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-full bg-primary-600 px-4 py-2 font-semibold text-white"
      >
        Download File
      </a>
    )}
  </div>
);

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  const [events, calendarPage, districtRows] = await Promise.all([
    sanityClient.fetch(`*[_type == "events"]{
      _id,
      title,
      dateandtime,
      description,
      joiners,
      poster,
      types,
      audience,
      classFormat,
      featured,
      featuredOrder,
      startDate,
      endDate,
      scheduleLabel,
      startTime,
      endTime,
      venue,
      district,
      area,
      eventFile {
        "url": asset->url
      },
      link,
      maplink
    }`),
    sanityClient.fetch(`*[_type == "calendarPage"][0]{
      subtitle,
      calendarSubscribeLabel,
      calendarSubscribeText,
      calendarSubscribeUrl,
      communityTitle,
      communityText,
      communityButtonLabel,
      districtTitle,
      districtText,
      districtButtonLabel
    }`),
    session?.user?.userId
      ? prisma.studentRecord.findMany({
          where: {
            deletedAt: null,
            schoolYear: PRIORITY_SCHOOL_YEAR,
            district: { not: null },
            student: {
              deletedAt: null,
              OR: [
                { creatorId: session.user.userId },
                {
                  members: {
                    some: {
                      email: session.user.email,
                      deletedAt: null,
                      status: InvitationStatus.ACCEPTED,
                    },
                  },
                },
              ],
            },
          },
          select: { district: true },
        })
      : [],
  ]);

  return {
    props: {
      events: events || [],
      calendarPage: calendarPage || null,
      studentDistricts: [
        ...new Set((districtRows || []).map((row) => row.district).filter(Boolean)),
      ],
    },
  };
};

export default Calendar;
