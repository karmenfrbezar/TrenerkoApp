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
          row-key="id"
          :loading="loading"
        >
          <template v-slot:body-cell-actions="props">
            <q-btn
              v-if="props.row.role !== 'admin'"
              color="negative"
              flat
              label="Obriši"
              @click="deleteUser(props.row.id)"
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
      { name: 'id', label: 'ID', field: 'id', sortable: true },
      { name: 'username', label: 'Username', field: 'username', sortable: true },
      { name: 'email', label: 'Email', field: 'email', sortable: true },
      { name: 'role', label: 'Uloga', field: 'role', sortable: true },
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
      users.value = users.value.filter(u => u.id !== id)
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
