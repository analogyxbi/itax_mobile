import * as React from 'react';
import { DataTable } from 'react-native-paper';

const UsersTable = ({users, roleData}) => {
  const [page, setPage] = React.useState(0);
  const [numberOfItemsPerPageList] = React.useState([10, 20, 30]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, users.length);

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  const getRole =(val)=>{
    const userRole = roleData?.find(role => role.id == val);
    return userRole?.name;
  }

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Name</DataTable.Title>
        <DataTable.Title numeric>Email</DataTable.Title>
        <DataTable.Title numeric>Role</DataTable.Title>
      </DataTable.Header>

      {users.slice(from, to).map((item) => (
        <DataTable.Row key={item.id}>
          <DataTable.Cell>{item.first_name + " " + item.last_name}</DataTable.Cell>
          <DataTable.Cell numeric>{item.email}</DataTable.Cell>
          <DataTable.Cell numeric>{getRole(item?.roles[0])}</DataTable.Cell>
        </DataTable.Row>
      ))}

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(users.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} of ${users.length}`}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        showFastPaginationControls
        selectPageDropdownLabel={'Rows per page'}
      />
    </DataTable>
  );
};

export default UsersTable;