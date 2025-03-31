import Hexo from "hexo";
import table from "fast-text-table";
import ora from "ora";

export default async () => {
  const hexo = new Hexo(process.cwd(), { silent: true });

  const spinner = ora({
    text: "Starting Hexo statistics...",
    color: "cyan",
  }).start();
  // https://github.com/hexojs/hexo/issues/2579#issuecomment-2058873076
  try {
    await hexo.init();
    await hexo.load();
    const posts = hexo.locals.get("posts").toArray();
    const postAsset = hexo.model("PostAsset");
    let numOfPostAssets = 0;
    let postContentTotalLen = 0;
    for (let post of posts) {
      const dir = post.path.slice(0, post.path.lastIndexOf("/"));
      const assets = postAsset.filter((x) => x._id.includes(dir));
      numOfPostAssets = numOfPostAssets + assets.length;
      postContentTotalLen = postContentTotalLen + post.content.length;
    }

    const pages = hexo.locals.get("pages").toArray();
    const pageAsset = hexo.model("Asset");
    let numOfPageAssets = 0;
    let pageContentTotalLen = 0;
    for (let page of pages) {
      const dir = page.path.slice(0, page.path.lastIndexOf("/"));
      const assets = pageAsset.filter((x) => x._id.includes(dir));
      numOfPageAssets = numOfPageAssets + assets.length;
      pageContentTotalLen = pageContentTotalLen + page.content.length;
    }

    const tags = hexo.locals.get("tags").toArray();
    const categories = hexo.locals.get("categories").toArray();
    const routes = hexo.route.list();

    spinner.succeed("Hexo statistics loaded.");

    console.log("\nHexo Statistics:\n");
    console.log(
      table([
        ["Number of posts: ", `${posts.length}`],
        ["Number of post assets: ", `${numOfPostAssets}`],
        [
          "Avg of post content length: ",
          `${
            posts.length > 0
              ? Math.floor(postContentTotalLen / posts.length)
              : 0
          }`,
        ],
        ["Number of pages: ", `${pages.length}`],
        ["Number of page assets: ", `${numOfPageAssets}`],
        [
          "Avg of page content length: ",
          `${
            pages.length > 0
              ? Math.floor(pageContentTotalLen / pages.length)
              : 0
          }`,
        ],
        ["Number of tags: ", `${tags.length}`],
        ["Number of categories: ", `${categories.length}`],
        ["Number of routes: ", `${routes.length}`],
      ])
    );
    return {
      posts: posts.length,
      postAssets: numOfPostAssets,
      postContentLength: postContentTotalLen,
      pages: pages.length,
      pageAssets: numOfPageAssets,
      pageContentLength: pageContentTotalLen,
      tags: tags.length,
      categories: categories.length,
      routes: routes.length,
    }
  } catch (e) {
    spinner.fail("Error loading Hexo statistics.");
    console.error(e);
  }
};
