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

desc "Generate a weeknote template for the specified week (or current week if not specified)"
task :new_weeknote, [:weeknum] do |t, args|
  output_dir = Pathname.new("src/_weeknotes/").realpath
  today = Date.today

  # Use provided weeknumber or calculate from current date
  weeknum = if args[:weeknum]
    week_int = args[:weeknum].to_i
    if week_int < 1 || week_int > 53
      puts "Error: Week number must be between 1 and 53"
      exit 1
    end
    args[:weeknum].rjust(2, "0")
  else
    today.strftime("%-V").rjust(2, "0")
  end

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
