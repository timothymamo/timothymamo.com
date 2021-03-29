const { processEntry } = require("@staticman/netlify-functions");
const queryString = require("querystring");

exports.handler = (event, context, callback) => {
  const repo = process.env.REPO;
  const [username, repository] = repo.split("/");
  const bodyData = queryString.parse(event.body);

  event.queryStringParameters = {
    ...event.queryStringParameters,
    ...bodyData,
    username,
    repository,
  };

  const config = {
    origin: event.headers.origin,
    sites: {
      [repo]: {
        allowedFields: ["name", "message", "post", "reply_to"],
        branch: "master",
        commitMessage: "New comment by {fields.name} in {options.slug}",
        filename: "entry-{@timestamp}",
        format: "yaml",
        generatedFields: {
          date: {
            type: "date",
            options: {
              format: iso8601
            },
          },
        },
        moderation: true,
        path: "data/comments/{options.slug}",
        requiredFields: ["name", "message", "post"],
      },
    },
  };

  return processEntry(event, context, callback, config);
};