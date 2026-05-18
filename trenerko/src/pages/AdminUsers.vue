<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Admin - Lista korisnika</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="users"
          :columns="columns"
          row-key="KorisnikID"
          :loading="loading"
        >
          <template v-slot:body-cell-actions="props">
            <q-btn
              v-if="props.row.Uloga !== 'Admin'"
              color="negative"
              flat
              label="Obriši"
              @click="deleteUser(props.row.KorisnikID)"
            />
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const users = ref([])
    const loading = ref(false)

    const columns = [
      { name: 'KorisnikID', label: 'ID', field: 'KorisnikID', sortable: true },
      { name: 'Ime', label: 'Ime', field: 'Ime', sortable: true },
      { name: 'Prezime', label: 'Prezime', field: 'Prezime', sortable: true },
      { name: 'Email', label: 'Email', field: 'Email', sortable: true },
      { name: 'Spol', label: 'Spol', field: 'Spol', sortable: true },
      { name: 'Uloga', label: 'Uloga', field: 'Uloga', sortable: true },
      { name: 'status_racuna', label: 'Status', field: 'status_racuna', sortable: true },
      { name: 'actions', label: 'Akcije', field: 'actions' }
    ]

    const fetchUsers = async () => {
      loading.value = true
      const res = await axios.get('http://localhost:3000/api/users')
      users.value = res.data
      loading.value = false
    }

    const deleteUser = async (id) => {
      await axios.delete(`http://localhost:3000/api/users/${id}`)
      users.value = users.value.filter(u => u.KorisnikID !== id)
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      users,
      columns,
      loading,
      deleteUser
    }
  }
}
</script>