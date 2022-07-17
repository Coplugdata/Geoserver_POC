
update uk_county set popden = t.popden from (

select c.id, sum (g.popden) popden from lsoa_mt_geo g, uk_county c
where g.popden is not null and
ST_Intersects(g.geom,c.geom) = 't' group by c.id) t
where t.id = uk_county.id;
limit 10;

update uk_county set popden =0 where popden is null;

select  * from bou_pop_lsoa_mt where usualres is not null;
limit 100;

select  count(*) from bou_pop_oa_mt limit 100;