!function (e, t) {
	"object" == typeof exports && "undefined" != typeof module ? t(exports, require("three")) : "function" == typeof define && define.amd ? define(["exports", "three"], t) : t(e.threePathfinding = {}, e.THREE)
}
(this, function (e, t) {
	var r = function () {};
	r.roundNumber = function (e, t) {
		var r = Math.pow(10, t);
		return Math.round(e * r) / r
	},
	r.sample = function (e) {
		return e[Math.floor(Math.random() * e.length)]
	},
	r.distanceToSquared = function (e, t) {
		var r = e.x - t.x,
		n = e.y - t.y,
		o = e.z - t.z;
		return r * r + n * n + o * o
	},
	r.isPointInPoly = function (e, t) {
		for (var r = !1, n = -1, o = e.length, i = o - 1; ++n < o; i = n)
			(e[n].z <= t.z && t.z < e[i].z || e[i].z <= t.z && t.z < e[n].z) && t.x < (e[i].x - e[n].x) * (t.z - e[n].z) / (e[i].z - e[n].z) + e[n].x && (r = !r);
		return r
	},
	r.isVectorInPolygon = function (e, t, r) {
		var n = 1e5,
		o = -1e5,
		i = [];
		return t.vertexIds.forEach(function (e) {
			n = Math.min(r[e].y, n),
			o = Math.max(r[e].y, o),
			i.push(r[e])
		}),
		!!(e.y < o + .5 && e.y > n - .5 && this.isPointInPoly(i, e))
	},
	r.triarea2 = function (e, t, r) {
		return (r.x - e.x) * (t.z - e.z) - (t.x - e.x) * (r.z - e.z)
	},
	r.vequal = function (e, t) {
		return this.distanceToSquared(e, t) < 1e-5
	};
	var n = function (e) {
		this.content = [],
		this.scoreFunction = e
	};
	n.prototype.push = function (e) {
		this.content.push(e),
		this.sinkDown(this.content.length - 1)
	},
	n.prototype.pop = function () {
		var e = this.content[0],
		t = this.content.pop();
		return this.content.length > 0 && (this.content[0] = t, this.bubbleUp(0)),
		e
	},
	n.prototype.remove = function (e) {
		var t = this.content.indexOf(e),
		r = this.content.pop();
		t !== this.content.length - 1 && (this.content[t] = r, this.scoreFunction(r) < this.scoreFunction(e) ? this.sinkDown(t) : this.bubbleUp(t))
	},
	n.prototype.size = function () {
		return this.content.length
	},
	n.prototype.rescoreElement = function (e) {
		this.sinkDown(this.content.indexOf(e))
	},
	n.prototype.sinkDown = function (e) {
		for (var t = this.content[e]; e > 0; ) {
			var r = (e + 1 >> 1) - 1,
			n = this.content[r];
			if (!(this.scoreFunction(t) < this.scoreFunction(n)))
				break;
			this.content[r] = t,
			this.content[e] = n,
			e = r
		}
	},
	n.prototype.bubbleUp = function (e) {
		for (var t = this.content.length, r = this.content[e], n = this.scoreFunction(r); ; ) {
			var o = e + 1 << 1,
			i = o - 1,
			s = null,
			a = void 0;
			if (i < t && (a = this.scoreFunction(this.content[i])) < n && (s = i), o < t && this.scoreFunction(this.content[o]) < (null === s ? n : a) && (s = o), null === s)
				break;
			this.content[e] = this.content[s],
			this.content[s] = r,
			e = s
		}
	};
	var o = function () {};
	o.init = function (e) {
		for (var t = 0; t < e.length; t++) {
			var r = e[t];
			r.f = 0,
			r.g = 0,
			r.h = 0,
			r.cost = 1,
			r.visited = !1,
			r.closed = !1,
			r.parent = null
		}
	},
	o.cleanUp = function (e) {
		for (var t = 0; t < e.length; t++) {
			var r = e[t];
			delete r.f,
			delete r.g,
			delete r.h,
			delete r.cost,
			delete r.visited,
			delete r.closed,
			delete r.parent
		}
	},
	o.heap = function () {
		return new n(function (e) {
			return e.f
		})
	},
	o.search = function (e, t, r) {
		this.init(e);
		var n = this.heap();
		for (n.push(t); n.size() > 0; ) {
			var o = n.pop();
			if (o === r) {
				for (var i = o, s = []; i.parent; )
					s.push(i), i = i.parent;
				return this.cleanUp(s),
				s.reverse()
			}
			o.closed = !0;
			for (var a = this.neighbours(e, o), h = 0, c = a.length; h < c; h++) {
				var u = a[h];
				if (!u.closed) {
					var p = o.g + u.cost,
					l = u.visited;
					if (!l || p < u.g) {
						if (u.visited = !0, u.parent = o, !u.centroid || !r.centroid)
							throw new Error("Unexpected state");
						u.h = u.h || this.heuristic(u.centroid, r.centroid),
						u.g = p,
						u.f = u.g + u.h,
						l ? n.rescoreElement(u) : n.push(u)
					}
				}
			}
		}
		return []
	},
	o.heuristic = function (e, t) {
		return r.distanceToSquared(e, t)
	},
	o.neighbours = function (e, t) {
		for (var r = [], n = 0; n < t.neighbours.length; n++)
			r.push(e[t.neighbours[n]]);
		return r
	};
	var i = function () {};
	i.buildZone = function (e) {
		var n = this,
		o = this._buildNavigationMesh(e),
		i = {};
		o.vertices.forEach(function (e) {
			e.x = r.roundNumber(e.x, 2),
			e.y = r.roundNumber(e.y, 2),
			e.z = r.roundNumber(e.z, 2)
		}),
		i.vertices = o.vertices;
		var s = this._buildPolygonGroups(o);
		return i.groups = new Array(s.length),
		s.forEach(function (e, o) {
			var s = new Map;
			e.forEach(function (e, t) {
				s.set(e, t)
			});
			var a = new Array(e.length);
			e.forEach(function (e, o) {
				var h = [];
				e.neighbours.forEach(function (e) {
					return h.push(s.get(e))
				});
				var c = [];
				e.neighbours.forEach(function (t) {
					return c.push(n._getSharedVerticesInOrder(e, t))
				});
				u = new laya.d3.math.Vector3( 0, 0, 0 );
				laya.d3.math.Vector3.add(u,i.vertices[e.vertexIds[0]],u);
				laya.d3.math.Vector3.add(u,i.vertices[e.vertexIds[1]],u);
				laya.d3.math.Vector3.add(u,i.vertices[e.vertexIds[2]],u);
				laya.d3.math.Vector3.scale(u,1/3,u);

				
				u.x = r.roundNumber(u.x, 2),
				u.y = r.roundNumber(u.y, 2),
				u.z = r.roundNumber(u.z, 2),
				a[o] = {
					id: o,
					neighbours: h,
					vertexIds: e.vertexIds,
					centroid: u,
					portals: c
				}
			}),
			i.groups[o] = a
		}),
		i
	},
	i._buildNavigationMesh = function (e) {
		return e.mergeVertices(),
		this._buildPolygonsFromGeometry(e)
	},
	i._buildPolygonGroups = function (e) {
		var t = [],
		r = function (e) {
			e.neighbours.forEach(function (t) {
				void 0 === t.group && (t.group = e.group, r(t))
			})
		};
		return e.polygons.forEach(function (e) {
			void 0 !== e.group ? t[e.group].push(e) : (e.group = t.length, r(e), t.push([e]))
		}),
		t
	},
	i._buildPolygonNeighbours = function (e, t) {
		var r = new Set,
		n = t[e.vertexIds[1]],
		o = t[e.vertexIds[2]];
		return t[e.vertexIds[0]].forEach(function (t) {
			t !== e && (n.includes(t) || o.includes(t)) && r.add(t)
		}),
		n.forEach(function (t) {
			t !== e && o.includes(t) && r.add(t)
		}),
		r
	},
	i._buildPolygonsFromGeometry = function (e) {
		for (var t = this, r = [], n = e.vertices, o = new Array(n.length), i = 0; i < n.length; i++)
			o[i] = [];
		return e.faces.forEach(function (e) {
			var t = {
				vertexIds: [e.a, e.b, e.c],
				neighbours: null
			};
			r.push(t),
			o[e.a].push(t),
			o[e.b].push(t),
			o[e.c].push(t)
		}),
		r.forEach(function (e) {
			e.neighbours = t._buildPolygonNeighbours(e, o)
		}), {
			polygons: r,
			vertices: n
		}
	},
	i._getSharedVerticesInOrder = function (e, t) {
		var r = e.vertexIds,
		n = r[0],
		o = r[1],
		i = r[2],
		s = t.vertexIds,
		a = s.includes(n),
		h = s.includes(o),
		c = s.includes(i);
		return a && h && c ? Array.from(r) : a && h ? [n, o] : h && c ? [o, i] : a && c ? [i, n] : (console.warn("Error processing navigation mesh neighbors; neighbors with <2 shared vertices found."), [])
	};
	var s = function () {
		this.portals = []
	};
	s.prototype.push = function (e, t) {
		void 0 === t && (t = e),
		this.portals.push({
			left: e,
			right: t
		})
	},
	s.prototype.stringPull = function () {
		var e,
		t,
		n,
		o = this.portals,
		i = [],
		s = 0,
		a = 0,
		h = 0;
		t = o[0].left,
		n = o[0].right,
		i.push(e = o[0].left);
		for (var c = 1; c < o.length; c++) {
			var u = o[c].left,
			p = o[c].right;
			if (r.triarea2(e, n, p) <= 0) {
				if (!(r.vequal(e, n) || r.triarea2(e, t, p) > 0)) {
					i.push(t),
					t = e = t,
					n = e,
					a = s = a,
					h = s,
					c = s;
					continue
				}
				n = p,
				h = c
			}
			if (r.triarea2(e, t, u) >= 0) {
				if (!(r.vequal(e, t) || r.triarea2(e, n, u) < 0)) {
					i.push(n),
					t = e = n,
					n = e,
					a = s = h,
					h = s,
					c = s;
					continue
				}
				t = u,
				a = c
			}
		}
		return 0 !== i.length && r.vequal(i[i.length - 1], o[o.length - 1].left) || i.push(o[o.length - 1].left),
		this.path = i,
		i
	};
	var a,
	h = function () {
		this.zones = {}
	};
	h.createZone = function (e) {
		return e.isGeometry ? console.warn("[three-pathfinding]: Use BufferGeometry, not Geometry, to create zone.") : e = (new t.Geometry).fromBufferGeometry(e),
		i.buildZone(e)
	},
	h.prototype.setZoneData = function (e, t) {
		this.zones[e] = t
	},
	h.prototype.getRandomNode = function (e, n, o, i) {
		if (!this.zones[e])
			return new laya.d3.math.Vector3;
		o = o || null,
		i = i || 0;
		var s = [];
		return this.zones[e].groups[n].forEach(function (e) {
			o && i ? r.distanceToSquared(o, e.centroid) < i * i && s.push(e.centroid) : s.push(e.centroid)
		}),
		r.sample(s) || new laya.d3.math.Vector3
	},
	h.prototype.getClosestNode = function (e, t, n, o) {
		void 0 === o && (o = !1);
		var i = this.zones[t].vertices,
		s = null,
		a = Infinity;
		return this.zones[t].groups[n].forEach(function (t) {
			var n = r.distanceToSquared(t.centroid, e);
			n < a && (!o || r.isVectorInPolygon(e, t, i)) && (s = t, a = n)
		}),
		s
	},
	h.prototype.findPath = function (e, r, n, i) {
		var a = this.zones[n].groups[i],
		h = this.zones[n].vertices,
		c = this.getClosestNode(e, n, i, !0),
		u = this.getClosestNode(r, n, i, !0);
		if (!c || !u)
			return null;
		var p = o.search(a, c, u),
		l = function (e, t) {
			for (var r = 0; r < e.neighbours.length; r++)
				if (e.neighbours[r] === t.id)
					return e.portals[r]
		},
		f = new s;
		f.push(e);
		for (var d = 0; d < p.length; d++) {
			var v = p[d + 1];
			if (v) {
				var g = l(p[d], v);
				f.push(h[g[0]], h[g[1]])
			}
		}
		f.push(r),
		f.stringPull();
		var y = f.path.map(function (e) {
				return new laya.d3.math.Vector3(e.x, e.y, e.z)
			});
		return y.shift(),
		y
	},
	h.prototype.getGroup = (a=1/*a = new t.Plane*/, function (e, t, n) {
		if (void 0 === n && (n = !1), !this.zones[e])
			return null;
		for (var o = null, i = Math.pow(50, 2), s = this.zones[e], h = 0; h < s.groups.length; h++)
			for (var c = 0, u = s.groups[h]; c < u.length; c += 1) {
				var p = u[c];
				if (n && (a.setFromCoplanarPoints(s.vertices[p.vertexIds[0]], s.vertices[p.vertexIds[1]], s.vertices[p.vertexIds[2]]), Math.abs(a.distanceToPoint(t)) < .01 && r.isPointInPoly([s.vertices[p.vertexIds[0]], s.vertices[p.vertexIds[1]], s.vertices[p.vertexIds[2]]], t)))
					return h;
				var l = r.distanceToSquared(p.centroid, t);
				l < i && (o = h, i = l)
			}
		return o
	}),
	h.prototype.clampStep = function () {
		var e,
		r,
		n ={},// new laya.d3.math.Vector3,//new t.Vector3,
		o = {},//new t.Plane,
		i = {},//new t.Triangle,
		s ={},// new laya.d3.math.Vector3,//new t.Vector3,
		a = {};//new laya.d3.math.Vector3;//new t.Vector3;
		return function (t, h, c, u, p, l) {
			var f = this.zones[u].vertices,
			d = this.zones[u].groups[p],
			v = [c],
			g = {};
			g[c.id] = 0,
			e = void 0,
			a.set(0, 0, 0),
			r = Infinity,
			o.setFromCoplanarPoints(f[c.vertexIds[0]], f[c.vertexIds[1]], f[c.vertexIds[2]]),
			o.projectPoint(h, n),
			s.copy(n);
			for (var y = v.pop(); y; y = v.pop()) {
				i.set(f[y.vertexIds[0]], f[y.vertexIds[1]], f[y.vertexIds[2]]),
				i.closestPointToPoint(s, n),
				n.distanceToSquared(s) < r && (e = y, a.copy(n), r = n.distanceToSquared(s));
				var M = g[y.id];
				if (!(M > 2))
					for (var b = 0; b < y.neighbours.length; b++) {
						var m = d[y.neighbours[b]];
						m.id in g || (v.push(m), g[m.id] = M + 1)
					}
			}
			return l.copy(a),
			e
		}
	}
	();
	e.Pathfinding = h
});
//# sourceMappingURL=three-pathfinding.umd.js.map
