require "bridgetown"

Bridgetown.load_tasks

# Run rake without specifying any command to execute a deploy build by default.
task default: :deploy

#
# Standard set of tasks, which you can customize if you wish:
#
desc "Build the Bridgetown site for deployment"
task :deploy => [:clean, "frontend:build"] do
  Bridgetown::Commands::Build.start
end

desc "Build the site in a test environment"
task :test do
  ENV["BRIDGETOWN_ENV"] = "test"
  Bridgetown::Commands::Build.start
end

desc "Runs the clean command"
task :clean do
  Bridgetown::Commands::Clean.start
end

namespace :frontend do
  desc "Build the frontend with esbuild for deployment"
  task :build do
    sh "yarn run esbuild"
  end

  desc "Watch the frontend with esbuild during development"
  task :dev do
    sh "yarn run esbuild-dev"
  rescue Interrupt
  end
end

#
# Add your own Rake tasks here! You can use `environment` as a prerequisite
# in order to write automations or other commands requiring a loaded site.
#
# task :my_task => :environment do
#   puts site.root_dir
#   automation do
#     say_status :rake, "I'm a Rake tast =) #{site.config.url}"
#   end
# end

desc "Generate a weeknote template for the current week"
task :new_weeknote do
  output_dir = Pathname.new("src/_weeknotes/").realpath
  today = Date.today
  weeknum =  today.strftime("%-V").rjust(2, "0")
  year = today.strftime("%G")

  filepath = "#{output_dir}/weeknote-#{year}-#{weeknum}.md"

  if Pathname.new(filepath).file?
    puts "already exists"
    exit
  end

  File.open(filepath, File::WRONLY|File::CREAT) do
    _1.write <<~TEMPLATE_END
      ---
      layout: weeknote
      title:
      slug: #{year}-#{weeknum}
      date: #{Time.now.iso8601}
      ---
    TEMPLATE_END
  end
end
