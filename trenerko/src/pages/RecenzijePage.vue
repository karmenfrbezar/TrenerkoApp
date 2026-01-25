<template>
  <q-page class="q-pa-md">

    <div class="row justify-center q-gutter-sm q-mb-md">
      <q-btn
        label="Popis recenzija"
        :flat="view !== 'list'"
        :color="view === 'list' ? 'primary' : 'grey-7'"
        @click="view = 'list'"
        rounded
      />
      <q-btn
        v-if="mainUser"
        label="Dodaj recenziju"
        :flat="view !== 'add'"
        :color="view === 'add' ? 'primary' : 'grey-7'"
        @click="view = 'add'"
        rounded
      />
      <q-btn
        v-if="mainUser"
        label="Obriši recenziju"
        :flat="view !== 'delete'"
        :color="view === 'delete' ? 'primary' : 'grey-7'"
        @click="view = 'delete'"
        rounded
      />
    </div>

    <div class="row justify-center">
      <div style="width: 100%; max-width: 600px;">

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

          <q-card v-for="r in filtrirane" :key="r.RecenzijaID" class="q-pa-md q-mb-md" style="border-radius: 15px;">
            <b>{{ r.NazivObjekta }}</b>
            : {{ r.Ocjena }} ⭐ <br />
            <div class="q-mb-sm">{{ r.Komentar }}</div>
            <small> - {{ r.username }}</small>

            <div class="row justify-end q-mt-md">
              <q-btn
                  v-if="mainUser && r.user_id === mainUser.id"
                  label="UREDI"
                  color="primary"
                  rounded
                  unelevated
                  class="q-px-md q-mb-sm shadow-2"
                  style="font-size: 13px;"
                  @click="editRecenzija(r)"
                />

            </div>
          </q-card>
        </div>

        <q-card v-if="view === 'add' || view === 'edit'" class="q-pa-md" style="border-radius: 15px;">
          <q-select
            v-if="view === 'add'"
            v-model="forma.ObjektID"
            :options="objekti"
            option-label="NazivObjekta"
            option-value="ObjektID"
            emit-value map-options
            label="Sportski objekt"

          />
          <q-input
  v-model="forma.Komentar"
  label="Komentar"
  type="textarea"
  class="q-mt-md"
  outlined
/>

<div class="q-mt-lg q-mb-lg text-center">
  <div class="text-grey-7 q-mb-xs" style="font-size: 1.1em;">Ocjena:</div>
  <q-rating
    v-model="forma.Ocjena"
    size="2.3em"
    :max="5"
    color="primary"
    icon="star_border"
    icon-selected="star"
  />
</div>

<div class="row justify-center q-gutter-sm">
            <q-btn
              :label="view === 'add' ? 'Spremi' : 'Spremi izmjene'"
              color="primary" rounded
              @click="view === 'add' ? dodaj() : spremiIzmjenu()"
            />
            <q-btn flat label="Odustani" @click="view = 'list'" />
          </div>
        </q-card>

        <div v-if="view === 'delete'">
          <q-card v-for="r in recenzije" :key="r.RecenzijaID" class="q-pa-md q-mb-md" style="border-radius: 15px;">
            <b>{{ r.NazivObjekta }}</b>
            <small> — {{ r.username }}</small><br />
            {{ r.Komentar }}

          <div class="row justify-end q-mt-md">
      <q-btn
        v-if="canDelete(r)"
        label="Obriši"
        color="negative"
        class="q-px-md q-mb-sm shadow-2"
        rounded
        unelevated
        @click="obrisi(r.RecenzijaID)"
      /> </div> </q-card>
</div>
      </div>
           </div> </q-page>
</template>

<script>

import { inject } from "vue";
import { Notify } from 'quasar';

const API = "https://trenerkoapp.onrender.com/api";

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
      // PROVJERA: Ako su polja prazna
      if (!this.forma.Komentar.trim() || !this.forma.ObjektID) {
        Notify.create({
          color: 'negative',
          icon: 'report_problem',
          message: 'Greška: Morate unijeti komentar i odabrati objekt!',
          position: 'top',
          timeout: 3000
        });
        return; // Prekida metodu, ne ide dalje na API
      }

      await this.api("/recenzije", "POST", { ...this.forma, user_id: this.mainUser.id });

      Notify.create({
        color: 'positive',
        icon: 'check_circle',
        message: 'Recenzija uspješno dodana!',
        position: 'top'
      });

      this.forma = { Komentar: "", Ocjena: 5, ObjektID: null };
      this.view = "list";
      this.ucitaj();
    },

    async spremiIzmjenu() {
      // PROVJERA: Ako je komentar prazan kod uređivanja
      if (!this.forma.Komentar.trim()) {
        Notify.create({
          color: 'negative',
          icon: 'warning',
          message: 'Komentar ne može biti prazan!',
          position: 'top'
        });
        return;
      }

      await this.api(`/recenzije/${this.editId}`, "PUT", { ...this.forma, user_id: this.mainUser.id });

      Notify.create({
        color: 'info',
        icon: 'save',
        message: 'Izmjene su spremljene!',
        position: 'top'
      });

      this.view = "list";
      this.ucitaj();
    },

    async obrisi(id) {
      await this.api(`/recenzije/${id}`, "DELETE", { user_id: this.mainUser.id });

      Notify.create({
        color: 'warning',
        textColor: 'black',
        icon: 'delete',
        message: 'Recenzija je obrisana.',
        position: 'top'
      });

      this.ucitaj();
    },
  },
};
</script>
