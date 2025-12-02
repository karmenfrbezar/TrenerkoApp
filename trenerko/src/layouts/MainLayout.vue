<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="drawer = !drawer"
        />

        <q-toolbar-title>Trenerko</q-toolbar-title>
        <q-btn flat label="Početna" to="/" />
        <q-btn flat label="Sportski objekti" to="/mapa" />
        <q-btn flat label="Pretraživanje" to="/pretraga" />
        <q-btn flat label="Rezervacije" to="/rezervacije" />
        <q-btn flat label="Recenzije" to="/recenzije" />
        <q-btn flat label="Dodaj objekte" to="/unos-objekata" />
        <q-btn color="secondary" label="Login" to="/login" />
        <q-btn flat label="Registracija" to="/registracija" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
    >
      <q-list>

        <q-item clickable v-ripple to="/">
          <q-item-section>Početna</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/mapa">
          <q-item-section>Sportski objekti</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/pretraga">
          <q-item-section>Pretraživanje</q-item-section>
        </q-item>
        
        <q-item clickable v-ripple to="/rezervacije">
          <q-item-section>Rezervacije</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/recenzije">
          <q-item-section>Recenzije</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/unos-objekata">
          <q-item-section>Dodaj objekte</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/login">
          <q-item-section>Login</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/registracija">
          <q-item-section>Registracija</q-item-section>
        </q-item>


      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    const drawer = ref(false)
    return {
      drawer
    }
  }
}
</script>
