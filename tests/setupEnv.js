delete process.env.WHITELIST;
delete process.env.GIST_WHITELIST;
delete process.env.EXCLUDE_REPO;
delete process.env.CACHE_SECONDS;
delete process.env.GITHUB_USERNAME;
process.env.NODE_ENV = "test";
