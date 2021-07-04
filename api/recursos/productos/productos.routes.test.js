let request = require("supertest");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

let Producto = require("./productos.model");
let Usuario = require("./../usuarios/usuarios.model");
let app = require("../../../index").app;
let server = require("../../../index").server;
let config = require("../../../config");
let mongoose = require('mongoose');

let productoYaEnBaseDeDatos = {
	titulo: "Macbook Pro 13 Inches",
	precio: 1300,
	moneda: "USD",
	dueno: "jancarlo",
};

let nuevoProducto = {
	titulo: "Cuerda mamut 50 metros",
	precio: 200,
	moneda: "USD",
};

let idInexistente = "60df4c3c6811b51cf83f2963";

let testUsuario = {
	username: "jancarlo",
	email: "jancarlo@gamil.com",
	password: "test12345",
};

let authToken;
let tokenInvalido =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZGY0OThkNjgxMWI1MWNmODNmMjk2NCIsImlhdCI6MTYyNTI0NjY5NiwiZXhwIjoxNjI1MzMzMDk2fQ.O6wSGo9OHV2As8NpmbXsvnfuQGiwPLq3xk3WQQGym87";

function obtenerToken(done) {
	Usuario.deleteMany({}, (err) => {
		if (err) done(err);
		request(app)
			.post("/usuarios")
			.send(testUsuario)
			.end((err, res) => {
				expect(res.status).toBe(201);
				request(app)
					.post("/usuarios/login")
					.send({
						username: testUsuario.username,
						password: testUsuario.password,
					})
					.end((err, res) => {
						expect(res.status).toBe(200);
						authToken = res.body.token;
						done();
					});
			});
	});
}

describe("Productos ", () => {
	beforeEach((done) => {
		Producto.deleteMany({}, (err) => {
			done();
		});
	});

	afterAll(async () => {
		server.close();
		await mongoose.disconnect();
	});

	describe("GET /productos/:id ", () => {
		it("Tratar de obtener un producto con un id invalido deberia retornar 400", (done) => {
			request(app)
				.get("/productos/123")
				.end((err, res) => {
					expect(res.status).toBe(400);
				});
			done();
		});

		it("Tratar de obtener un producto que no existe deberia retornar 404", (done) => {
			request(app)
				.get(`/productos/${idInexistente}`)
				.end((err, res) => {
					expect(res.status).toBe(404);
					done();
				});
		});

		it("Deberia retornar un producto que si existe exitosamente", (done) => {
			Producto(productoYaEnBaseDeDatos)
				.save()
				.then((producto) => {
					request(app)
						.get(`/productos/${producto._id}`)
						.end((err, res) => {
							expect(res.status).toBe(200);
							expect(res.body).toBeInstanceOf(Object);
							expect(res.body.titulo).toEqual(producto.titulo);
							expect(res.body.precio).toEqual(producto.precio);
							expect(res.body.moneda).toEqual(producto.moneda);
							expect(res.body.dueno).toEqual(producto.dueno);

							done();
						});
				})
				.catch((err) => {
					done(err);
				});
		});
	});

	describe("POST /productos/ ", () => {
		beforeAll(obtenerToken);

		it("Si el usuario provee un token valido y el producto tambien es valido, deberia ser creado", (done) => {
			request(app)
				.post("/productos")
				.set("Authorization", `Bearer ${authToken}`)
				.send(nuevoProducto)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(201);
					expect(res.body.titulo).toEqual(nuevoProducto.titulo);
					expect(res.body.moneda).toEqual(nuevoProducto.moneda);
					expect(res.body.precio).toEqual(nuevoProducto.precio);
					expect(res.body.dueno).toEqual(testUsuario.username);
					done();
				});
		});

		it("Si el usuario no provee un token de autenticacion valido, deberia retornar 401", (done) => {
			request(app)
				.post("/productos")
				.set("Authorization", `Bearer ${tokenInvalido}`)
				.send(nuevoProducto)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(401);
					done();
				});
		});

		it("Si al producto le falta el precio, no deberia ser creado", (done) => {
			request(app)
				.post("/productos")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					titulo: nuevoProducto.titulo,
					moneda: nuevoProducto.moneda,
				})
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(400);
					done();
				});
		});

		it("Si al producto le falta la moneda, no deberia ser creado", (done) => {
			request(app)
				.post("/productos")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					titulo: nuevoProducto.titulo,
					precio: nuevoProducto.precio,
				})
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(400);
					done();
				});
		});

		it("Si al producto le falta el titulo, no deberia ser creado", (done) => {
			request(app)
				.post("/productos")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					moneda: nuevoProducto.moneda,
					precio: nuevoProducto.precio,
				})
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(400);
					done();
				});
		});
	});

	describe("DELETE /productos/:id ", () => {
		let idDeProductoExistente;
		beforeAll(obtenerToken);

		beforeEach((done) => {
			Producto.deleteMany({}, (err) => {
				if (err) done(err);
				Producto(productoYaEnBaseDeDatos)
					.save()
					.then((producto) => {
						idDeProductoExistente = producto._id;
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
		});

		it("Tratar de borrar un producto con un id invalido deberia retornar 400", (done) => {
			request(app)
				.delete("/productos/123")
				.set("Authorization", `Bearer ${authToken}`)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(400);
					done();
				});
		});

		it("Tratar de borrar un producto que no existe deberia retornar 404", (done) => {
			request(app)
				.delete(`/productos/${idInexistente}`)
				.set("Authorization", `Bearer ${authToken}`)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(404);
					done();
				});
		});

		it("Si el usuario provee un token invalido, deberia retonar 401", (done) => {
			request(app)
				.delete(`/productos/${idInexistente}`)
				.set("Authorization", `Bearer ${tokenInvalido}`)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(401);
					done();
				});
		});

		it("Si el usuario no es el dueno del producto, deberia retornar 401", (done) => {
			Producto({
				titulo: "Adidas gazelle",
				precio: 90,
				moneda: "USD",
				dueno: "ricardo234",
			})
				.save()
				.then((producto) => {
					request(app)
						.delete(`/productos/${producto._id}`)
						.set("Authorization", `Bearer ${authToken}`)
						.end((err, res) => {
							if (err) done(err);
							expect(res.status).toBe(401);
							done();
						});
				});
		});

		it("Si el usuario es dueno del producto y entrega un token valido, el producto deberia ser borrado", (done) => {
			request(app)
				.delete(`/productos/${idDeProductoExistente}`)
				.set("Authorization", `Bearer ${authToken}`)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(200);
					expect(res.body.titulo).toEqual(productoYaEnBaseDeDatos.titulo);
					expect(res.body.precio).toEqual(productoYaEnBaseDeDatos.precio);
					expect(res.body.moneda).toEqual(productoYaEnBaseDeDatos.moneda);
					expect(res.body.dueno).toEqual(productoYaEnBaseDeDatos.dueno);
					Producto.findById(idDeProductoExistente)
						.then((producto) => {
							expect(producto).toBeNull();
							done();
						})
						.catch((err) => {
							done(err);
						});
				});
		});
	});

	describe("PUT /productos/:id ", () => {
		let idDeProductoExistente;
		beforeAll(obtenerToken);

		beforeEach((done) => {
			Producto.deleteMany({}, (err) => {
				if (err) done(err);
				Producto(productoYaEnBaseDeDatos)
					.save()
					.then((producto) => {
						idDeProductoExistente = producto._id;
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
		});

		it("Tratar de actualizar un producto con id invalido, deberia retornar 400", (done) => {
			request(app)
				.put("/productos/123")
				.send(productoYaEnBaseDeDatos)
				.set("Authorization", `Bearer ${authToken}`)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(400);
					done();
				});
		});

		it("Si el usuario no provee un token de autenticacion valido para actualizar un producto, deberia retornar 401", (done) => {
			request(app)
				.put(`/productos/${idDeProductoExistente}`)
				.set("Authorization", `Bearer ${tokenInvalido}`)
				.send(nuevoProducto)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(401);
					done();
				});
		});

		it("Si el usuario no provee un producto no existente, deberia retornar 404", (done) => {
			request(app)
				.put(`/productos/${idInexistente}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send(nuevoProducto)
				.end((err, res) => {
					if (err) done(err);
					expect(res.status).toBe(404);
					done();
				});
		});

		it("Si el usuario no es dueno del producto no lo puede actualizar", (done) => {
			Producto({
				titulo: "Adidas gazelle",
				precio: 90,
				moneda: "USD",
				dueno: "ricardPodf",
			})
				.save()
				.then((producto) => {
					request(app)
						.put(`/productos/${producto._id}`)
						.set("Authorization", `Bearer ${authToken}`)
						.send({
                            titulo: 'ramdon',
                            precio: 50,
                            moneda: 'USD'
                        })
						.end((err, res) => {
							if (err) done(err);
							expect(res.status).toBe(401);
							done();
						});
				});
		});

        it("Si el usuario no provee precio, no se puede actualizar", (done) => {
			request(app)
            .put(`/productos/${idDeProductoExistente}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                titulo: 'ramdon',
                moneda: 'USD'
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(400);
                done();
            });
		});

        it("Si el usuario no provee precio, no se puede actualizar", (done) => {
			request(app)
            .put(`/productos/${idDeProductoExistente}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                titulo: 'ramdon',
                moneda: 'USD'
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(400);
                done();
            });
		});

        it("Si el usuario no provee moneda, no se puede actualizar", (done) => {
			request(app)
            .put(`/productos/${idDeProductoExistente}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                titulo: 'ramdon',
                precio: 400
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(400);
                done();
            });
		});

        it("Si el usuario no provee titulo, no se puede actualizar", (done) => {
			request(app)
            .put(`/productos/${idDeProductoExistente}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                moneda: 'USD',
                precio: 400
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(400);
                done();
            });
		});

        it("Si el provee la informacion adecuada, podra actualizarlo", (done) => {
            let productoaActualizado = {
                moneda: 'USD',
                precio: 30,
                titulo: 'actualizar producto'
            };
			request(app)
            .put(`/productos/${idDeProductoExistente}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(productoaActualizado)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body.moneda).toEqual(productoaActualizado.moneda);
                expect(res.body.precio).toEqual(productoaActualizado.precio);
                expect(res.body.titulo).toEqual(productoaActualizado.titulo);
                done();
            });
		});
        
	});
});
