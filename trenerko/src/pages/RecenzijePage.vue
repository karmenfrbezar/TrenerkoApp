<template>
  <q-page class="q-pa-md">
    <!-- Gumbovi -->
    <q-btn-group class="q-mb-md">
      <q-btn label="Popis recenzija" @click="view = 'list'" />
      <q-btn
        v-if="mainUser"
        label="Dodaj recenziju"
        @click="view = 'add'"
      />
      <q-btn
        v-if="mainUser"
        label="Obriši recenziju"
        color="negative"
        @click="view = 'delete'"
      />
    </q-btn-group>

    <!-- FILTRIRANJE I PRIKAZ RECENZIJA -->
    <div v-if="view === 'list'">
      <q-input
        v-model="filterText"
        label="Filtriraj po nazivu objekta"
        clearable
        dense
        class="q-mb-sm"
      />
      <q-select
        v-model="filterObjekt"
        :options="objekti"
        option-label="NazivObjekta"
        option-value="ObjektID"
        emit-value
        map-options
        label="Filtriraj po objektu"
        clearable
        dense
        class="q-mb-md"
      />
      <q-card
        v-for="r in filtrirane"
        :key="r.RecenzijaID"
        class="q-pa-md q-mb-md"
      >
        <b>{{ r.NazivObjekta }}</b>
        <small>— {{ r.username }}</small><br />
        {{ r.Ocjena }} ⭐<br />
        {{ r.Komentar }}

        <!-- Gumb za uređivanje ako je autor -->
        <q-btn
          v-if="mainUser && r.user_id === mainUser.id && view !== 'edit'"
          label="Uredi"
          flat
          color="primary"
          class="q-mt-sm"
          @click="editRecenzija(r)"
        />
      </q-card>
    </div>

    <!-- FORMA ZA UREĐIVANJE RECENZIJE -->
    <q-card v-if="view === 'edit'" class="q-pa-md">
      <q-input
        v-model="editData.Komentar"
        label="Komentar"
        type="textarea"
        class="q-mt-md"
      />
      <q-input
        v-model.number="editData.Ocjena"
        label="Ocjena (1-5)"
        type="number"
        min="1"
        max="5"
        class="q-mt-md"
      />
      <q-btn
        label="Spremi izmjene"
        color="primary"
        class="q-mt-md"
        @click="spremiIzmjenu"
      />
      <q-btn
        label="Odustani"
        flat
        color="negative"
        class="q-mt-md"
        @click="view = 'list'"
      />
    </q-card>

    <!-- FORMA ZA DODAVANJE RECENZIJE -->
    <q-card v-if="view === 'add'" class="q-pa-md">
      <q-select
        v-model="nova.ObjektID"
        :options="objekti"
        option-label="NazivObjekta"
        option-value="ObjektID"
        emit-value
        map-options
        label="Sportski objekt"
        dense
      />
      <q-input
        v-model="nova.Komentar"
        label="Komentar"
        type="textarea"
        class="q-mt-md"
      />
      <q-input
        v-model.number="nova.Ocjena"
        label="Ocjena (1-5)"
        type="number"
        min="1"
        max="5"
        class="q-mt-md"
      />
      <q-btn label="Spremi" color="primary" class="q-mt-md" @click="dodaj" />
    </q-card>

    <!-- PRIKAZ I BRISANJE RECENZIJA -->
    <div v-if="view === 'delete'">
      <q-card
        v-for="r in recenzije"
        :key="r.RecenzijaID"
        class="q-pa-md q-mb-md"
      >
        <b>{{ r.NazivObjekta }}</b>
        <small>— {{ r.username }}</small><br />
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
export default {
  data() {
    return {
      view: "list",
      recenzije: [],
      objekti: [],
      filterObjekt: null,
      filterText: "",
      nova: {
        Komentar: "",
        Ocjena: 5,
        ObjektID: null,
      },
      editData: null,
    };
  },
  computed: {
    filtrirane() {
      let filtered = this.recenzije;

      if (this.filterObjekt) {
        filtered = filtered.filter(
          (r) => Number(r.ObjektID) === Number(this.filterObjekt)
        );
      }

      if (this.filterText && this.filterText.trim() !== "") {
        const ft = this.filterText.toLowerCase();
        filtered = filtered.filter((r) =>
          r.NazivObjekta.toLowerCase().includes(ft)
        );
      }

      return filtered;
    },
  },
  mounted() {
    this.ucitaj();
  },
  setup() {
    const mainUser = inject("user");
    return { mainUser };
  },
  methods: {
    async ucitaj() {
      try {
        const rec = await fetch("http://localhost:3000/api/recenzije");
        const recJson = await rec.json();

        const raw = await fetch("http://localhost:3000/api/objects");
        const rawObjekti = await raw.json();

        this.objekti = (rawObjekti || []).map((o) => ({
          ObjektID: o.ObjektID ?? o.id ?? o.ObjektID,
          NazivObjekta: o.NazivObjekta ?? o.naziv ?? o.NazivObjekta,
          ...o,
        }));

        const objektiMap = {};
        this.objekti.forEach((o) => {
          objektiMap[String(o.ObjektID)] = o.NazivObjekta;
        });

        this.recenzije = (recJson || []).map((r) => ({
          RecenzijaID: r.RecenzijaID ?? r.id ?? r.RecenzijaID,
          ObjektID: r.ObjektID ?? r.gym_id ?? r.ObjektID,
          NazivObjekta:
            r.NazivObjekta ?? objektiMap[String(r.ObjektID)] ?? "",
          Ocjena: r.Ocjena ?? r.rating ?? r.Ocjena,
          Komentar: r.Komentar ?? r.comment ?? r.Komentar,
          username: r.username || r.user_name || "Nepoznati",
          user_id: r.user_id ?? null,
          ...r,
        }));
      } catch (e) {
        console.error("Greška pri učitavanju podataka:", e);
        alert("Greška pri učitavanju podataka — pogledaj konzolu za detalje.");
      }
    },

    async dodaj() {
      if (!this.mainUser) {
        alert("Morate biti prijavljeni da dodate recenziju.");
        return;
      }
      if (!this.nova.ObjektID || !this.nova.Komentar || this.nova.Ocjena == null) {
        alert("Molimo popunite sva polja");
        return;
      }
      const payload = {
        Komentar: this.nova.Komentar,
        Ocjena: this.nova.Ocjena,
        ObjektID: this.nova.ObjektID,
        user_id: this.mainUser.id,
      };
      try {
        const res = await fetch("http://localhost:3000/api/recenzije", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || `Greška ${res.status}`);
          return;
        }
        this.nova = { Komentar: "", Ocjena: 5, ObjektID: null };
        this.view = "list";
        this.ucitaj();
      } catch (e) {
        console.error("Greška pri dodavanju recenzije:", e);
        alert("Došlo je do greške, pokušajte ponovno.");
      }
    },

    canDelete(rec) {
      return this.mainUser && rec.user_id === this.mainUser.id;
    },

    async obrisi(id) {
      if (!this.mainUser) {
        alert("Morate biti prijavljeni da brišete recenzije.");
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/api/recenzije/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: this.mainUser.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "Greška pri brisanju recenzije");
          return;
        }
        this.ucitaj();
      } catch (e) {
        console.error("Greška pri brisanju recenzije:", e);
        alert("Došlo je do greške, pokušajte ponovno.");
      }
    },

    editRecenzija(rec) {
      this.editData = { ...rec };
      this.view = "edit";
    },

    async spremiIzmjenu() {
      if (!this.mainUser) {
        alert("Morate biti prijavljeni da uređujete recenziju.");
        return;
      }
      if (!this.editData.Komentar || this.editData.Ocjena == null) {
        alert("Molimo popunite sva polja");
        return;
      }
      try {
        const payload = {
          Komentar: this.editData.Komentar,
          Ocjena: this.editData.Ocjena,
          user_id: this.mainUser.id,
        };
        const res = await fetch(
          `http://localhost:3000/api/recenzije/${this.editData.RecenzijaID}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || `Greška ${res.status}`);
          return;
        }
        this.editData = null;
        this.view = "list";
        this.ucitaj();
      } catch (e) {
        console.error("Greška pri uređivanju recenzije:", e);
        alert("Došlo je do greške, pokušajte ponovno.");
      }
    },
  },
};
</script>
