import { useMemo, useState } from 'react';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { getSession } from 'next-auth/react';
import { InvitationStatus } from '@prisma/client';
import {
  CalendarIcon,
  ClockIcon,
  LocationMarkerIcon,
  SearchIcon,
} from '@heroicons/react/outline';

import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import sanityClient, { imageBuilder } from '@/lib/server/sanity';
import ImageModal from '@/components/Modal/Image-Modal';
import prisma from '@/prisma/index';
import {
  DISTRICT_LABELS,
  REGION_LABELS,
  canViewEvent,
  familyRegions,
  regionDistricts,
  resolveEventScope,
  scopeDistricts,
} from '@/utils/district-regions';

const PRIORITY_SCHOOL_YEAR = '2026-2027';
const FEATURED_LIMIT = 8;

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

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'online', label: 'Online' },
  { id: 'cottage', label: 'Cottage Class' },
  { id: 'students', label: 'Students' },
  { id: 'parents', label: 'Parents' },
];

const ALL_DISTRICTS = 'all';
const MY_DISTRICTS = 'mine';

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

const formatClockLabel = (value) =>
  String(value || '')
    .trim()
    .replace(/(\d)\s*(am|pm)\b/gi, (_, hour, meridiem) => `${hour} ${meridiem.toUpperCase()}`);

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
  if (dates.length) {
    const start = formatManilaDate(dates[0]);
    const end =
      dates.length > 1 ? formatManilaDate(dates[dates.length - 1]) : '';
    return end && end !== start ? `${start} – ${end}` : start;
  }
  const description = plainText(event.description).replace(/\s+/g, ' ').trim();
  return description || '';
};

const timeText = (event) => {
  if (event.startTime && event.endTime) {
    return `${formatClockLabel(event.startTime)} – ${formatClockLabel(event.endTime)}`;
  }
  if (event.startTime) return formatClockLabel(event.startTime);
  const value = event.dateandtime?.[0];
  if (!value || isDateOnly(value)) return '';
  return formatManilaTime(value);
};

const venueText = (event) => {
  if (event.venue) return event.venue;
  const link = String(event.maplink || '').toLowerCase();
  const online = (event.types || []).includes('ONLINE') || link.includes('zoom');
  if (online) return 'Zoom (Online)';
  if (event.maplink) return 'View map';
  return '';
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

const matchesDistrictSelection = (event, selection, studentDistricts) => {
  if (selection === ALL_DISTRICTS) return true;
  if (!event.districtKey) return false;
  const covered = scopeDistricts(event.districtKey);
  if (selection === MY_DISTRICTS) {
    return studentDistricts.some((district) => covered.includes(district));
  }
  return covered.includes(selection);
};

const labelList = (keys, labels) =>
  [...new Set(keys.map((key) => labels[key]).filter(Boolean))].join(' and ');

const Calendar = ({ events, calendarPage, studentDistricts, regions }) => {
  const [filter, setFilter] = useState('all');
  const [districtSelection, setDistrictSelection] = useState(ALL_DISTRICTS);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [showFeatured, setShowFeatured] = useState(true);

  const prepared = useMemo(
    () =>
      (events || []).map((event) => ({
        ...event,
        audience: inferAudience(event),
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
    () => prepared.filter((event) => !isFinished(event)),
    [prepared],
  );

  const regionOptions = useMemo(
    () =>
      regions.map((region) => ({
        region,
        districts: regionDistricts(region),
      })),
    [regions],
  );

  const featured = useMemo(() => {
    const flagged = current
      .filter((event) => event.featured)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
    if (flagged.length) return flagged.slice(0, FEATURED_LIMIT);
    return current
      .filter((event) => eventTimestamp(event))
      .sort((a, b) => eventTimestamp(a) - eventTimestamp(b))
      .slice(0, FEATURED_LIMIT);
  }, [current]);

  const featuredSliderOptions = useMemo(() => {
    const slideable = (perPage) => {
      const overflow = featured.length > perPage;
      return { perPage, arrows: overflow, pagination: overflow, drag: overflow };
    };
    return {
      ...slideable(3),
      gap: '1rem',
      rewind: true,
      classes: {
        prev: 'splide__arrow--prev !left-0',
        next: 'splide__arrow--next !right-0',
      },
      breakpoints: {
        1279: slideable(2),
        639: slideable(1),
      },
    };
  }, [featured.length]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return current
      .filter((event) => {
        if (!matchesDistrictSelection(event, districtSelection, studentDistricts)) {
          return false;
        }
        if (filter === 'online' && !event.online) {
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
  }, [current, filter, query, studentDistricts, districtSelection]);

  const regionNames = labelList(regions, REGION_LABELS);
  const myDistrictsLabel = labelList(studentDistricts, DISTRICT_LABELS);
  const selectionLabel =
    districtSelection === MY_DISTRICTS
      ? myDistrictsLabel
      : DISTRICT_LABELS[districtSelection];

  const showDistrictEvents = () => {
    setFilter('all');
    setShowDistrictPicker(true);
    if (regionOptions.length) setDistrictSelection(MY_DISTRICTS);
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-primary-600">Featured Events</h2>
          <div className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-primary-600">
            <button
              type="button"
              className="hover:underline"
              onClick={() => {
                setFilter('all');
                setQuery('');
                setShowDistrictPicker(false);
                setDistrictSelection(ALL_DISTRICTS);
                document.getElementById('all-events')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              View all events
            </button>
            <span aria-hidden="true">|</span>
            <button
              type="button"
              className="hover:underline"
              onClick={() => setShowFeatured((visible) => !visible)}
            >
              {showFeatured ? 'Hide Featured Events' : 'Show Featured Events'}
            </button>
          </div>
        </div>
        {showFeatured &&
          (featured.length ? (
            <Splide
              key={featured.map((event) => event._id).join()}
              options={featuredSliderOptions}
              aria-label="Featured events"
              className={`pb-8 ${
                featured.length > 1 ? 'px-11' : ''
              } ${featured.length > 2 ? 'sm:px-11' : 'sm:px-0'} ${
                featured.length > 3 ? 'xl:px-11' : 'xl:px-0'
              }`}
            >
              {featured.map((event) => (
                <SplideSlide key={event._id} className="flex">
                  <EventCard
                    event={event}
                    expanded={expandedEventId === event._id}
                    onToggle={() =>
                      setExpandedEventId(
                        expandedEventId === event._id ? null : event._id,
                      )
                    }
                    onImageClick={setExpandedImage}
                  />
                </SplideSlide>
              ))}
            </Splide>
          ) : (
            <Content.Empty>No featured events yet.</Content.Empty>
          ))}
      </section>

      <section id="all-events" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="shrink-0">
            <label className="relative block">
              <span className="sr-only">Search events</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events"
                className="w-full rounded-full border border-gray-200 py-2 pl-9 pr-4 text-sm sm:w-56"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                  filter === item.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-primary-600 ring-1 ring-primary-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {showDistrictPicker && regionOptions.length > 0 && (
          <label className="block">
            <span className="sr-only">Choose a district</span>
            <select
              value={districtSelection}
              onChange={(event) => setDistrictSelection(event.target.value)}
              className="w-full rounded-full border border-gray-200 py-2 pl-4 pr-8 text-sm sm:w-56"
            >
              <option value={ALL_DISTRICTS}>All districts</option>
              <option value={MY_DISTRICTS}>My district ({myDistrictsLabel})</option>
              {regionOptions.map(({ region, districts }) => (
                <optgroup key={region} label={REGION_LABELS[region]}>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {DISTRICT_LABELS[district]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}

        <p className="text-sm text-gray-500">
          {districtSelection !== ALL_DISTRICTS
            ? `Showing ${selectionLabel} events only.`
            : regionNames
              ? `LP events for everyone, plus events from all ${regionNames} districts.`
              : 'LP events for everyone. District events appear once a 2026–2027 district is saved.'}
        </p>

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

      <section className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-primary-600 p-5 text-white">
          <CalendarIcon className="mb-3 h-8 w-8 text-secondary-300" />
          <h3 className="text-lg font-bold">
            {(
              calendarPage?.calendarSubscribeLabel ||
              'Subscribe to the LP Google Calendar'
            ).replace('LP Manila Google Calendar', 'LP Google Calendar')}
          </h3>
          <p className="mt-2 text-sm text-primary-100">
            {calendarPage?.calendarSubscribeText ||
              'Get the latest updates on events, activities, and important dates.'}
          </p>
          <a
            href={
              calendarPage?.calendarSubscribeUrl ||
              'https://calendar.google.com/calendar/u/0/r/month/2026/10/1'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-600"
          >
            Subscribe now
          </a>
        </article>
        <article className="rounded-2xl border bg-white p-5">
          <LocationMarkerIcon className="mb-3 h-8 w-8 text-primary-600" />
          <h3 className="text-lg font-bold text-primary-700">
            {calendarPage?.districtTitle || 'Explore District Events'}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {calendarPage?.districtText ||
              (regionNames
                ? `Check out events happening across our ${regionNames} districts.`
                : 'Check out events happening in our Cebu, Luzon, and Mindanao districts.')}
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
  <article className="flex w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
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
      {event.schedule && (
        <p className="flex items-start gap-2 text-sm text-gray-600">
          <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
          <span>{event.schedule}</span>
        </p>
      )}
      {event.time && (
        <p className="flex items-start gap-2 text-sm text-gray-600">
          <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
          <span>{event.time}</span>
        </p>
      )}
      {event.venueLabel && (
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
      )}
      {hasEventDetails(event) && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-auto rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      )}
      {expanded && hasEventDetails(event) && <EventDetails event={event} />}
    </div>
  </article>
);

const hasEventDetails = (event) => {
  const description = plainText(event.description).replace(/\s+/g, ' ').trim();
  return Boolean(
    (description && description !== event.schedule) ||
      event.districtKey ||
      event.joiners?.filter(Boolean).length ||
      event.link ||
      event.eventFile?.url,
  );
};

const EventDetails = ({ event }) => (
  <div className="space-y-3 border-t pt-3 text-sm text-gray-600">
    {plainText(event.description).replace(/\s+/g, ' ').trim() !== event.schedule &&
      event.description && <PortableText value={event.description} />}
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

  const studentDistricts = [
    ...new Set((districtRows || []).map((row) => row.district).filter(Boolean)),
  ];
  const regions = familyRegions(studentDistricts);
  const visibleEvents = (events || []).reduce((list, event) => {
    const scope = resolveEventScope(event);
    if (!canViewEvent(scope, regions)) return list;
    list.push({ ...event, districtKey: scope.districtKey, regionKey: scope.regionKey });
    return list;
  }, []);

  return {
    props: {
      events: visibleEvents,
      calendarPage: calendarPage || null,
      studentDistricts,
      regions,
    },
  };
};

export default Calendar;
