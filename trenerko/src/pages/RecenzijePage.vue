<template>
  <q-page class="q-pa-md">

    <!-- GUMBI -->
    <q-btn-group class="q-mb-md">
      <q-btn label="Popis recenzija" @click="view = 'list'" />
      <q-btn v-if="mainUser" label="Dodaj recenziju" @click="view = 'add'" />
      <q-btn v-if="mainUser" label="Obriši recenziju" color="negative" @click="view = 'delete'" />
    </q-btn-group>

    <!-- LISTA + FILTERI -->
    <div v-if="view === 'list'">
      <q-input
        v-model="filterText"
        label="Filtriraj po nazivu objekta"
        dense clearable
        class="q-mb-sm"
      />
      <q-select
        v-model="filterObjekt"
        :options="objekti"
        option-label="NazivObjekta"
        option-value="ObjektID"
        emit-value map-options
        label="Filtriraj po objektu"
        dense clearable
        class="q-mb-md"
      />

      <q-card v-for="r in filtrirane" :key="r.RecenzijaID" class="q-pa-md q-mb-md">
        <b>{{ r.NazivObjekta }}</b>
        <small> — {{ r.username }}</small><br />
        {{ r.Ocjena }} ⭐<br />
        {{ r.Komentar }}

        <q-btn
          v-if="mainUser && r.user_id === mainUser.id"
          label="Uredi"
          flat color="primary"
          class="q-mt-sm"
          @click="editRecenzija(r)"
        />
      </q-card>
    </div>

    <!-- DODAVANJE / UREĐIVANJE -->
    <q-card v-if="view === 'add' || view === 'edit'" class="q-pa-md">
      <q-select
        v-if="view === 'add'"
        v-model="forma.ObjektID"
        :options="objekti"
        option-label="NazivObjekta"
        option-value="ObjektID"
        emit-value map-options
        label="Sportski objekt"
      />

      <q-input v-model="forma.Komentar" label="Komentar" type="textarea" class="q-mt-md" />
      <q-input v-model.number="forma.Ocjena" label="Ocjena (1–5)" type="number" min="1" max="5" />

      <q-btn
        :label="view === 'add' ? 'Spremi' : 'Spremi izmjene'"
        color="primary"
        class="q-mt-md"
        @click="view === 'add' ? dodaj() : spremiIzmjenu()"
      />
      <q-btn flat label="Odustani" class="q-mt-md" @click="view = 'list'" />
    </q-card>

    <!-- BRISANJE -->
    <div v-if="view === 'delete'">
      <q-card v-for="r in recenzije" :key="r.RecenzijaID" class="q-pa-md q-mb-md">
        <b>{{ r.NazivObjekta }}</b>
        <small> — {{ r.username }}</small><br />
        {{ r.Komentar }}
        <q-btn
          v-if="canDelete(r)"
          label="Obriši"
          color="negative"
          flat
          class="q-mt-sm"
          @click="obrisi(r.RecenzijaID)"
        />
      </q-card>
    </div>

  </q-page>
</template>

<script>
import { inject } from "vue";
const API = "http://localhost:3000/api";

export default {
  setup() {
    return { mainUser: inject("user") };
  },

  data() {
    return {
      view: "list",
      recenzije: [],
      objekti: [],
      filterText: "",
      filterObjekt: null,
      forma: { Komentar: "", Ocjena: 5, ObjektID: null },
      editId: null,
    };
  },

  computed: {
    filtrirane() {
      return this.recenzije.filter(r =>
        (!this.filterObjekt || +r.ObjektID === +this.filterObjekt) &&
        (!this.filterText || r.NazivObjekta.toLowerCase().includes(this.filterText.toLowerCase()))
      );
    },
  },

  mounted() {
    this.ucitaj();
  },

  methods: {
    async api(url, method = "GET", body) {
      const res = await fetch(`${API}${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });
      return res.json();
    },

    async ucitaj() {
  const [rec, obj] = await Promise.all([
    this.api("/recenzije"),
    this.api("/objects"),
  ]);

  this.recenzije = rec;

  this.objekti = obj.map(o => ({
    ObjektID: o.ObjektID ?? o.id,
    NazivObjekta: o.NazivObjekta ?? o.naziv ?? o.name
  }));
},


    canDelete(r) {
      return this.mainUser && r.user_id === this.mainUser.id;
    },

    editRecenzija(r) {
      this.forma = { Komentar: r.Komentar, Ocjena: r.Ocjena, ObjektID: r.ObjektID };
      this.editId = r.RecenzijaID;
      this.view = "edit";
    },

    async dodaj() {
      await this.api("/recenzije", "POST", { ...this.forma, user_id: this.mainUser.id });
      this.view = "list";
      this.ucitaj();
    },

    async spremiIzmjenu() {
      await this.api(`/recenzije/${this.editId}`, "PUT", { ...this.forma, user_id: this.mainUser.id });
      this.view = "list";
      this.ucitaj();
    },

    async obrisi(id) {
      await this.api(`/recenzije/${id}`, "DELETE", { user_id: this.mainUser.id });
      this.ucitaj();
    },
  },
};
</script>


