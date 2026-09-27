# Flattens _data/topics.yml into site.data["topic_index"]:
#   slug => { "name", "path" => [ancestors as {name, slug}], "children" => [{name, slug}] }
# Category archive pages use it to show the breadcrumb and sub-topics of a category.
module Jekyll
  class TopicIndexGenerator < Generator
    safe true
    priority :highest

    def generate(site)
      index = {}
      walk = lambda do |nodes, path|
        (nodes || []).each do |node|
          kids = node["children"] || []
          index[node["slug"]] = {
            "name" => node["name"],
            "path" => path,
            "children" => kids.map { |c| { "name" => c["name"], "slug" => c["slug"] } },
          }
          walk.call(kids, path + [{ "name" => node["name"], "slug" => node["slug"] }])
        end
      end
      walk.call(site.data["topics"], [])
      site.data["topic_index"] = index
    end
  end
end
