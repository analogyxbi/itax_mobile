import { Entypo } from '@expo/vector-icons';
import * as React from 'react';
import { DataTable } from 'react-native-paper';

const ApiConfigTable = ({
  apiConfigs,
  message,
  setMessage,
  setModalVisible,
  setFormData,
}) => {
  const [page, setPage] = React.useState(0);
  const [numberOfItemsPerPageList] = React.useState([10, 20, 30]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, apiConfigs.length);

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>URL</DataTable.Title>
        <DataTable.Title numeric>Username</DataTable.Title>
        <DataTable.Title numeric>Action</DataTable.Title>
      </DataTable.Header>

      {apiConfigs.slice(from, to).map((item) => (
        <DataTable.Row key={item.id}>
          <DataTable.Cell>{item.base_url}</DataTable.Cell>
          <DataTable.Cell numeric>{item.api_username}</DataTable.Cell>
          <DataTable.Cell numeric>
            <Entypo
              onPress={() => {
                setMessage('Edit');
                setFormData(item);
                setModalVisible(true);
              }}
              name="edit"
              size={24}
              color="black"
            />
          </DataTable.Cell>
        </DataTable.Row>
      ))}

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(apiConfigs.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} of ${apiConfigs.length}`}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        showFastPaginationControls
        selectPageDropdownLabel={'Rows per page'}
      />
    </DataTable>
  );
};

export default ApiConfigTable;
