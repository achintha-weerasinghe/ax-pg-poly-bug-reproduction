drop table if exists public.episodes;
drop table if exists public.collections;

create table public.collections (
	id uuid primary key default gen_random_uuid(),
	title varchar not null,
	type varchar not null,
	count_seasons int,
	count_episodes int
);

create table public.episodes (
	id uuid primary key default gen_random_uuid(),
	collection_id uuid not null,
	url varchar not null,
	constraint fk_collection
		foreign key (collection_id)
			references public.collections (id)
);

-- insert movies
insert into public.collections (title, type)
values ('Harry potter', 'movie');
insert into public.collections (title, type)
values ('Lord of the ring', 'movie');

-- insert movie with trailer
do $$
declare id1 uuid;
begin
insert into public.collections (title, type)
values ('Final destination', 'movie')
returning id into id1;

insert into public.episodes (collection_id, url)
values (
	id1,
	'https://axinom.com/trailer1'
);
insert into public.episodes (collection_id, url)
values (
 	id1,
	'https://axinom.com/trailer2'
);
insert into public.episodes (collection_id, url)
values (
	id1,
	'https://axinom.com/trailer3'
);
end $$;

-- insert season
do $$
declare id1 uuid;
begin
insert into public.collections (title, type, count_seasons, count_episodes)
values ('Game of thrones', 'season', 8, 80)
returning id into id1;

insert into public.episodes (collection_id, url)
values (
	id1,
	'https://axinom.com/episode1'
);
insert into public.episodes (collection_id, url)
values (
 	id1,
	'https://axinom.com/episode2'
);
insert into public.episodes (collection_id, url)
values (
	id1,
	'https://axinom.com/episode3'
);
end $$;

comment on table public.collections is $$@interface mode:single type:type
@type movie name:CollectionMovie
@type season name:CollectionSeason attributes:count_seasons,count_episodes
$$;
