delete process.env.WHITELIST;
delete process.env.GIST_WHITELIST;
delete process.env.EXCLUDE_REPO;
delete process.env.CACHE_SECONDS;
process.env.NODE_ENV = "test";
