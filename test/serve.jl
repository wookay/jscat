# https://github.com/wookay/Bukdu.jl

#=
julia -i serve.jl
=#

using Bukdu # ApplicationController Conn redirect_to routes get plug Plug CLI

struct FrontController <: ApplicationController
    conn::Conn
end

function index(c::FrontController)
    redirect_to(c.conn, "/test")
end

routes() do
    get("/", FrontController, index)
    plug(Plug.Static, at="/test", only=["index.html"], from=normpath(@__DIR__))
    plug(Plug.Static, at="/test", only=["test_"], from=normpath(@__DIR__))
    plug(Plug.Static, at="/test/deps", from=normpath(@__DIR__, "deps"))
end

Bukdu.start(8080)
CLI.routes()
