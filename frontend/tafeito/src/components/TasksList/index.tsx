import React from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AttachFile from '@mui/icons-material/AttachFile';
import Label from '@mui/icons-material/Label';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Task, Category, Tag, Anexo } from '../../common/types';
import { useAxios, baseUrl, TokenProps } from '../../hooks/useAxios';
import TagsInput from '../TagsInput';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';

type TasksListProps = {
  tasks: Task[];
  category: Category;
  updateTasks: () => void;
}

type ResponseDeleteTask = {

}

type ResponsePatchTask = {

}

export default function TasksList(props:TasksListProps) {
  const {
    category,
    tasks,
    updateTasks
  } = props;

  const [checked, setChecked] = React.useState([0]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState('');

  const anexosInputsRef = React.useRef<any>([]);

  const itemFromStorage: string|null = window.localStorage.getItem("token");
  let tokenObj: TokenProps|null;

  if (itemFromStorage != null) {
    tokenObj = JSON.parse(itemFromStorage);
  }


  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const {
    commit: commitTask,
    response: taskId
  } = useAxios<ResponseDeleteTask>({
    method: 'DELETE',
    path: `tarefas`
  });

  const {
    commit: commitFinishTask,
  } = useAxios<ResponsePatchTask>({
    method: 'POST',
    path: `tarefas/:id/concluir`
  });

  const {
    commit: commitReopenTask,
  } = useAxios<ResponsePatchTask>({
    method: 'POST',
    path: `tarefas/:id/reabrir`
  });

  const {
    commit: commitAddTag,
  } = useAxios<ResponsePatchTask>({
    method: 'POST',
    path: `tarefas/:id/etiquetas`
  });

  const {
    commit: commitRemoveTag,
  } = useAxios<ResponsePatchTask>({
    method: 'DELETE',
    path: `tarefas/:id/etiquetas`
  });


  const deleteTask = (taskId:number) => {
    commitTask({}, updateTasks, `tarefas/${taskId}`)
  }

  const updateTaskStatus = (taskId:number, status:boolean) => {
    if(status === true) {
      commitFinishTask({}, updateTasks, `tarefas/${taskId}/concluir`)
    } else {
      commitReopenTask({}, updateTasks, `tarefas/${taskId}/reabrir`)
    }
  }
  const addTag = (taskId:number, newTag:Tag) => {

    commitAddTag({
      etiqueta: newTag.etiqueta
    }, updateTasks, `tarefas/${taskId}/etiquetas`)
  }

  const removeTag = (taskId:number, removedTag:Tag) => {
    commitRemoveTag({}, updateTasks, `tarefas/${taskId}/etiquetas/${removedTag.etiqueta}`)
  }

  const handleNewAttachment = async (eventt: React.ChangeEvent<HTMLInputElement>, task: Task) => {
    let response: any;
    const formData = new FormData();

    if (eventt.target.files) {
      formData.append("arquivo", eventt.target.files[0]);

      try {
        response = await axios({
          method: 'POST',
          url: `${baseUrl}tarefas/${task.id}/anexos`,
          headers: {
            Authorization: `Bearer ${tokenObj?.token}`
          },
          data: formData,
        });
      } catch (error) {
        console.log('erro ao adicionar anexo a tarefa', error);
        setSnackBarMessage("Erro ao adicionar anexo a tarefa");
        setOpenSnackbar(true);
        return;
      }
      eventt.target.value = '';
      updateTasks();
    }
  };

  const handleDeleteAttachment = async (task: Task, elementAnexo: Anexo) => {
    let response: any;

    try {
      response = await axios({
        method: 'DELETE',

        url: `${baseUrl}tarefas/${task.id}/anexos/${elementAnexo.id}`,
        headers: {
          Authorization: `Bearer ${tokenObj?.token}`
        },
      });
    } catch (error) {
      console.log('erro ao excluir anexo da tarefa', error);
      setSnackBarMessage("Erro ao excluir anexo da tarefa");
      setOpenSnackbar(true);
    }

    updateTasks();
  };

  const handleDownloadAttachment = async (task: Task, elementAnexo: Anexo) => {
    let response: any;

    try {
      response = await axios({
        method: 'GET',

        url: `${baseUrl}tarefas/${task.id}/anexos/${elementAnexo.id}`,
        headers: {
          Authorization: `Bearer ${tokenObj?.token}`
        },
        responseType: "blob",
      });

      const objectUrl = URL.createObjectURL(new Blob([response.data]));

      const downloadable = document.createElement("a");
      downloadable.href = objectUrl;
      downloadable.setAttribute("download", elementAnexo.nome);
      downloadable.click();
      downloadable.remove();

    } catch (error) {
      console.log('erro ao baixar o anexo da tarefa', error);
      setSnackBarMessage("Erro ao baixar o anexo da tarefa");
      setOpenSnackbar(true);
    }
  };

  return (
    <>
    <Typography variant='h4' >
      {category.descricao}
    </Typography>
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {tasks.map((task) => {
        const labelId = `checkbox-list-label-${task.id}`;

        return (
          <>
          <ListItem
            key={task.id}
            secondaryAction={
              <Stack direction='row' spacing={1}>
                <Tooltip title='Adicionar Anexo'>
                  <IconButton
                    edge="end"
                    aria-label="anexos"
                    onClick={
                      () => {
                        anexosInputsRef.current[`task-${task.id}`].click();
                      }
                    }
                  >
                    <AttachFile />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title='Excluir tarefa'
                >
                  <IconButton
                    edge="end"
                    aria-label="excluir"
                    onClick={() => { deleteTask(task.id) }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
            disablePadding
          >
            <ListItem role={undefined} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.concluida}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => updateTaskStatus(task.id, event.target.checked)}
                />
              </ListItemIcon>
              <ListItemText id={labelId} 
                primary={task.descricao} 
                sx={{textDecoration:task.concluida ? 'line-through' : 'none'}}
                secondary={(
                <TagsInput
                  selectedTags={(newTags) => {}}
                  addTag={(newTag) => addTag(task.id, newTag)}
                  removeTag={(removedTag) => removeTag(task.id, removedTag)}
                  tags={task.etiquetas}
                  placeholder="add Tags"
                />)} 
              />
            </ListItem>            
          </ListItem>
          <ListItem
            style={{
              visibility: 'hidden',
              display: 'none',
            }}
          >
            <input
              ref={
                (element) => {
                  anexosInputsRef.current[`task-${task.id}`] = element;
                }
              }
              type="file"
              onChange={
                (eventt: React.ChangeEvent<HTMLInputElement>) => {
                  handleNewAttachment(eventt, task);
                }
              }
              style={{
                visibility: 'hidden',
                display: 'none',
              }}
            />
          </ListItem>
          <ListItem>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {
                task.anexos.map((elementAnexo:Anexo) => {
                  return (
                    <ListItem
                      key={elementAnexo.id}
                      secondaryAction={
                        <Stack direction='row' spacing={1}>
                          <Tooltip title='Baixar anexo'>
                            <IconButton
                              edge="end"
                              aria-label="Baixar anexo"
                              onClick={
                                () => {
                                  handleDownloadAttachment(task, elementAnexo);
                                }
                              }>
                              <FileDownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Excluir anexo'>
                            <IconButton
                              edge="end"
                              aria-label="excluir anexo"
                              onClick={
                                () => {
                                  handleDeleteAttachment(task, elementAnexo);
                                }
                              }>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    >
                      <ListItemIcon></ListItemIcon>
                      <ListItemText id={labelId}
                        primary={elementAnexo.nome}
                      >
                      </ListItemText>
                    </ListItem>
                  )
                })
              }
            </List>
          </ListItem>
          </>
        );
      })}
    </List>
    <Snackbar
      open={openSnackbar}
      autoHideDuration={6000}
      onClose={
        (eventt, reason) => {
          eventt.preventDefault();
          setOpenSnackbar(false);
        }
      }
      message={snackBarMessage}
    />
    </>
  );
}