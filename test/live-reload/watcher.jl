using FileWatching # FolderMonitor

dir = normpath(@__DIR__, "..")
fm = FolderMonitor(dir)

function reload_chrome()
    run(`osascript chrome.scpt`)
end

watching_files = ["test_roughjs.js"]

loop = Task() do
    while fm.open
        (fname, events) = wait(fm)::Pair
        println("fname ", fname)
        fname in watching_files && reload_chrome()
    end
end
schedule(loop)
